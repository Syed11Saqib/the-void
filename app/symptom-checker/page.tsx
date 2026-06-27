'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfiles } from '@/lib/hooks/useProfiles';
import { useSymptomChecker } from '@/lib/hooks/useSymptomChecker';
import { useSpeech } from '@/lib/hooks/useSpeech';
import { AssistantFace, type FaceState } from '@/components/symptom/AssistantFace';
import { EmergencyAlert } from '@/components/emergency/EmergencyAlert';
import { HealthSummaryCard } from '@/components/summary/HealthSummaryCard';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function SymptomCheckerPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const { activeProfile, loading } = useProfiles(userId ?? '');
  const [input, setInput] = useState('');
  const speech = useSpeech();

  const profile = activeProfile;
  const checker = useSymptomChecker(profile);

  const lastAssistantTextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!speech.isListening && speech.transcript) {
      setInput(speech.transcript);
    }
  }, [speech.isListening, speech.transcript]);

  // Speak the latest assistant follow-up question aloud.
  useEffect(() => {
    const lastAssistant = [...checker.messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant && lastAssistant.text !== lastAssistantTextRef.current) {
      lastAssistantTextRef.current = lastAssistant.text;
      speech.speak(lastAssistant.text);
    }
  }, [checker.messages, speech]);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!profile) router.replace('/profiles');
  }, [profile, authLoading, loading, router]);

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-foreground/50">Loading…</div>;
  }

  if (!profile) {
    return null;
  }

  function handleSend() {
    if (!input.trim()) return;
    checker.submitText(input.trim());
    setInput('');
    speech.resetTranscript();
  }

  const faceState: FaceState = checker.emergencyFlag.triggered
    ? 'concerned'
    : speech.isListening
    ? 'listening'
    : checker.phase === 'thinking'
    ? 'thinking'
    : speech.isSpeaking
    ? 'speaking'
    : 'idle';

  return (
    <main className="relative flex min-h-screen flex-col px-5 py-6 sm:px-8 sm:py-8">
      <EmergencyAlert
        flag={checker.emergencyFlag}
        onFindHospital={() => router.push('/hospitals')}
        onContinue={checker.dismissEmergency}
      />

      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="flex h-9 w-9 items-center justify-center rounded-full glass shadow-soft focus-ring"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-foreground/70" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">Symptom Checker</h1>
          <p className="text-xs text-foreground/50">for {profile.name}</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 py-6">
        <AssistantFace state={faceState} />

        <AnimatePresence mode="wait">
          {checker.phase === 'summary' && checker.summary ? (
            <motion.div key="summary" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {checker.error && (
                <p className="mb-3 rounded-2xl bg-warn-50 px-4 py-2.5 text-center text-xs text-warn-600">
                  {checker.error}
                </p>
              )}
              <HealthSummaryCard summary={checker.summary} />
              <Button variant="outline" className="mt-4 w-full" onClick={checker.reset}>
                Start a new check
              </Button>
            </motion.div>
          ) : (
            <motion.div key="input" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {checker.messages.length > 0 && (
                <div className="mb-4 max-h-48 space-y-2 overflow-y-auto rounded-2xl glass p-3">
                  {checker.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <span
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.role === 'user'
                            ? 'bg-mint-500 text-white'
                            : 'bg-white/80 text-foreground/80'
                        }`}
                      >
                        {m.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    checker.phase === 'followup'
                      ? checker.followUpQuestion ?? 'Type your answer…'
                      : "What's bothering you today? e.g. fever since yesterday, mild headache"
                  }
                  className="min-h-32 pr-14 text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                {speech.supported && (
                  <button
                    onClick={speech.isListening ? speech.stopListening : speech.startListening}
                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-soft focus-ring transition-colors ${
                      speech.isListening ? 'bg-sky-500 text-white' : 'bg-white/80 text-foreground/60'
                    }`}
                    aria-label={speech.isListening ? 'Stop listening' : 'Start voice input'}
                    type="button"
                  >
                    {speech.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}
              </div>

              <div className="mt-3 flex gap-3">
                {speech.isSpeaking && (
                  <Button variant="ghost" size="md" onClick={speech.cancelSpeech}>
                    <Volume2 className="h-4 w-4" /> Stop voice
                  </Button>
                )}
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleSend}
                  disabled={!input.trim() || checker.phase === 'thinking'}
                >
                  {checker.phase === 'thinking' ? 'Thinking…' : <>
                    <Send className="h-4 w-4" /> Send
                  </>}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="text-center text-xs text-foreground/40">This is not a medical diagnosis.</footer>
    </main>
  );
}
