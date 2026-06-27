'use client';

import { useCallback, useState } from 'react';
import { detectEmergency } from '@/lib/emergency/ruleEngine';
import { buildFallbackSummary } from '@/lib/services/aiService';
import type { ChatMessage, EmergencyFlag, HealthSummary, Profile } from '@/lib/types';

type CheckerPhase = 'input' | 'thinking' | 'followup' | 'summary';

export function useSymptomChecker(profile: Profile | null) {
  const [phase, setPhase] = useState<CheckerPhase>('input');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpCount, setFollowUpCount] = useState(0);
  const [emergencyFlag, setEmergencyFlag] = useState<EmergencyFlag>({ triggered: false });
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitText = useCallback(
    async (text: string) => {
      if (!profile) return;
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        createdAt: new Date().toISOString(),
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setError(null);

      // Step 1: independent rule engine — always runs first, no network needed.
      const flag = detectEmergency(text);
      if (flag.triggered) {
        setEmergencyFlag(flag);
      }

      setPhase('thinking');

      // Step 2: AI call. Must not block emergency UI, and must degrade gracefully.
      try {
        const res = await fetch('/api/symptom-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, messages: nextMessages, followUpCount }),
        });

        if (!res.ok) {
          let errMsg = 'AI_UNAVAILABLE';
          try {
            const errData = await res.json();
            if (errData?.error) {
              errMsg = errData.error;
            }
          } catch {}
          throw new Error(errMsg);
        }
        const result = await res.json();

        if (result.needsFollowUp && result.followUpQuestion && followUpCount < 2) {
          const assistantMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: result.followUpQuestion,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setFollowUpQuestion(result.followUpQuestion);
          setFollowUpCount((c) => c + 1);
          setPhase('followup');
          return;
        }

        const finalSummary: HealthSummary = {
          patientName: profile.name,
          urgency: flag.triggered ? 'emergency' : result.urgency,
          possibleCause: result.possibleCause,
          homeCare: result.homeCare,
          doctorRecommendation: result.doctorRecommendation,
          emergencySigns: result.emergencySigns,
          disclaimer: 'This is not a medical diagnosis.',
          followUpAsked: followUpCount,
        };
        setSummary(finalSummary);
        setPhase('summary');
      } catch (e) {
        // Step 3: AI failed — show a safe fallback summary, never a blank screen.
        const errMsg = e instanceof Error ? e.message : 'We could not reach the assistant.';
        setError(`AI Error: ${errMsg}. Showing general safety guidance instead.`);
        const fallback = buildFallbackSummary(profile);
        if (flag.triggered) fallback.urgency = 'emergency';
        setSummary(fallback);
        setPhase('summary');
      }
    },
    [messages, profile, followUpCount]
  );

  const reset = useCallback(() => {
    setPhase('input');
    setMessages([]);
    setFollowUpCount(0);
    setEmergencyFlag({ triggered: false });
    setSummary(null);
    setFollowUpQuestion(null);
    setError(null);
  }, []);

  const dismissEmergency = useCallback(() => {
    setEmergencyFlag({ triggered: false });
  }, []);

  return {
    phase,
    messages,
    emergencyFlag,
    summary,
    followUpQuestion,
    error,
    submitText,
    reset,
    dismissEmergency,
  };
}
