import type { ChatMessage, HealthSummary, Profile, Urgency } from '@/lib/types';

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
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const CANDIDATE_MODELS = [
    'openai/gpt-oss-20b:free',
    'google/gemma-4-31b-it:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free',
  ];

  const configuredModel = process.env.OPENROUTER_MODEL;
  const modelsToTry = configuredModel
    ? [configuredModel, ...CANDIDATE_MODELS.filter((m) => m !== configuredModel)]
    : CANDIDATE_MODELS;

  const profileContext = `Patient context: age ${profile.age}, gender ${profile.gender}, diabetes: ${profile.conditions.diabetes}, blood pressure: ${profile.conditions.bloodPressure}, asthma: ${profile.conditions.asthma}, smoking: ${profile.conditions.smoking}, allergies: ${profile.allergies.join(', ') || 'none'}. Follow-up questions already asked: ${followUpCount}/2.`;

  const conversation = messages.map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
    content: m.text,
  }));

  const errors: string[] = [];

  for (const modelToUse of modelsToTry) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: profileContext },
            ...conversation,
          ],
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        let errMsg = `OpenRouter request failed for ${modelToUse}: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.metadata?.raw) {
            errMsg = errData.error.metadata.raw;
          } else if (errData?.error?.message) {
            errMsg = errData.error.message;
          }
        } catch {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      const content: string = data?.choices?.[0]?.message?.content ?? '';

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
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`Model ${modelToUse} failed: ${msg}`);
      errors.push(`${modelToUse}: ${msg}`);
    }
  }

  throw new Error(`All models failed: ${errors.join(' | ')}`);
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
