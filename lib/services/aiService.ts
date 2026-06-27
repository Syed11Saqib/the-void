import type { ChatMessage, HealthSummary, Profile, Urgency } from '@/lib/types';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are DR.VOID, a healthcare TRIAGE ASSISTANT. You are NOT a doctor.

HARD RULES (never break these, no matter what the user asks):
- NEVER name a specific disease as if it is confirmed. Only say "possible cause" framed as a guess, never a diagnosis.
- NEVER prescribe any medicine, drug, supplement, or herbal remedy.
- NEVER give a dosage of any substance, even over-the-counter.
- NEVER contradict or override emergency guidance.
- Only home-care advice allowed: rest, water/hydration, warm or cold compress, healthy food, sleep, hygiene.
- Ask AT MOST two short follow-up questions total, only if essential, in simple English.
- Keep all responses short and simple (a worried, possibly low-literacy user is reading this).
- Always end your structured summary with: "This is not a medical diagnosis."
- Estimate urgency strictly as one of: low, medium, high.
- If you detect anything resembling a medical emergency, say so plainly and tell the user to seek emergency care immediately — do not attempt home care advice in that case.

You must respond ONLY with strict JSON matching this shape, no prose outside JSON:
{
  "needsFollowUp": boolean,
  "followUpQuestion": string | null,
  "urgency": "low" | "medium" | "high",
  "possibleCause": string,
  "homeCare": string[],
  "doctorRecommendation": string,
  "emergencySigns": string[]
}`;

interface AnalyzeParams {
  profile: Profile;
  messages: ChatMessage[];
  followUpCount: number;
}

interface AIResult {
  needsFollowUp: boolean;
  followUpQuestion: string | null;
  urgency: Urgency;
  possibleCause: string;
  homeCare: string[];
  doctorRecommendation: string;
  emergencySigns: string[];
}

const FORBIDDEN_PATTERNS = [
  /\b\d+\s*(mg|ml|mcg|g|tablet|tablets|pill|pills)\b/i,
  /\btake\s+\d+/i,
];

function sanitizeAIResult(raw: AIResult): AIResult {
  // Defense in depth: strip anything resembling dosage instructions even if
  // the model slips up, since this is a hard product safety requirement.
  const clean = (s: string) =>
    FORBIDDEN_PATTERNS.some((p) => p.test(s))
      ? 'Please consult a doctor for any medicine or dosage guidance.'
      : s;

  return {
    ...raw,
    possibleCause: clean(raw.possibleCause),
    doctorRecommendation: clean(raw.doctorRecommendation),
    homeCare: raw.homeCare.map(clean),
  };
}

export async function analyzeSymptoms({
  profile,
  messages,
  followUpCount,
}: AnalyzeParams): Promise<AIResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Get your Gemini API Key at https://aistudio.google.com/');
  }

  const ai = new GoogleGenAI({ apiKey });

  const profileContext = `Patient context: age ${profile.age}, gender ${profile.gender}, diabetes: ${profile.conditions.diabetes}, blood pressure: ${profile.conditions.bloodPressure}, asthma: ${profile.conditions.asthma}, smoking: ${profile.conditions.smoking}, allergies: ${profile.allergies.join(', ') || 'none'}. Follow-up questions already asked: ${followUpCount}/2.`;

  const systemInstruction = `${SYSTEM_PROMPT}\n\n${profileContext}`;

  const contents = messages.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.text }],
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text || '';

  let parsed: AIResult;
  try {
    const jsonStr = content.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    parsed = JSON.parse(jsonStr);
  } catch {
    parsed = {
      needsFollowUp: false,
      followUpQuestion: null,
      urgency: 'medium',
      possibleCause: content.trim(),
      homeCare: [],
      doctorRecommendation: 'Please consult a doctor for further advice.',
      emergencySigns: [],
    };
  }

  if (followUpCount >= 2) {
    parsed.needsFollowUp = false;
    parsed.followUpQuestion = null;
  }

  return sanitizeAIResult(parsed);
}

export function buildHealthSummary(
  profile: Profile,
  result: AIResult,
  followUpAsked: number
): HealthSummary {
  return {
    patientName: profile.name,
    urgency: result.urgency,
    possibleCause: result.possibleCause,
    homeCare: result.homeCare,
    doctorRecommendation: result.doctorRecommendation,
    emergencySigns: result.emergencySigns,
    disclaimer: 'This is not a medical diagnosis.',
    followUpAsked,
  };
}

/**
 * Fallback summary used when the AI API fails outright.
 * The app must never go blank just because the LLM call failed.
 */
export function buildFallbackSummary(profile: Profile): HealthSummary {
  return {
    patientName: profile.name,
    urgency: 'medium',
    possibleCause:
      "We couldn't reach the assistant right now, so we can't estimate a possible cause.",
    homeCare: ['Drink water and rest', 'Avoid strain', 'Monitor your symptoms closely'],
    doctorRecommendation:
      'Please visit a doctor or the nearest government hospital to get checked, especially if symptoms worsen.',
    emergencySigns: [
      'Severe chest pain',
      'Difficulty breathing',
      'Sudden weakness or confusion',
      'Heavy bleeding',
    ],
    disclaimer: 'This is not a medical diagnosis.',
    followUpAsked: 0,
  };
}
