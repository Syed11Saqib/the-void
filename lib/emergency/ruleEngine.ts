// Independent rule engine for emergency detection.
// This MUST run before any AI call, and MUST work even if the AI API fails.
// It is intentionally simple, deterministic, and keyword/pattern based —
// no network dependency, no model dependency.

import type { EmergencyFlag } from '@/lib/types';

interface Rule {
  category: EmergencyFlag['category'];
  patterns: RegExp[];
  message: string;
}

const RULES: Rule[] = [
  {
    category: 'chest_pain',
    patterns: [
      /chest\s*(pain|pressure|tight|crushing|heavy)/i,
      /pain.*(left arm|jaw).*chest/i,
      /heart attack/i,
    ],
    message:
      'Possible signs of a heart attack. Sit down, stay calm, and get emergency help immediately.',
  },
  {
    category: 'stroke',
    patterns: [
      /face.*(droop|numb|sag)/i,
      /sudden.*(numb|weak).*(face|arm|leg|side)/i,
      /slurred speech/i,
      /can'?t speak properly/i,
      /sudden.*confusion/i,
      /stroke/i,
    ],
    message:
      'Possible signs of a stroke. Note the time symptoms started and get emergency help immediately.',
  },
  {
    category: 'severe_bleeding',
    patterns: [
      /(heavy|severe|uncontrolled|won'?t stop).*bleed/i,
      /bleeding.*(a lot|heavily|won'?t stop)/i,
      /deep cut/i,
      /blood.*(everywhere|won'?t stop)/i,
    ],
    message: 'Apply firm pressure to the wound with a clean cloth and get emergency help immediately.',
  },
  {
    category: 'poisoning',
    patterns: [
      /(swallowed|drank|ate).*(poison|chemical|bleach|acid|pesticide)/i,
      /poisoning/i,
      /accidentally (drank|swallowed)/i,
    ],
    message:
      'Do not induce vomiting unless told to by emergency services. Get emergency help immediately and keep the substance container if available.',
  },
  {
    category: 'overdose',
    patterns: [
      /overdose/i,
      /took too many (pills|tablets|medicine|medication)/i,
      /(too many|extra) (pills|tablets)/i,
    ],
    message: 'Get emergency help immediately. Keep the person awake and seated if possible.',
  },
  {
    category: 'suicide_risk',
    patterns: [
      /suicid/i,
      /kill myself/i,
      /end my life/i,
      /(want|going) to die/i,
      /self.?harm/i,
      /no reason to live/i,
    ],
    message:
      'You matter, and immediate support is available right now. Please reach out to a crisis helpline or emergency services — you do not have to go through this alone.',
  },
  {
    category: 'breathing_difficulty',
    patterns: [
      /can'?t breathe/i,
      /(severe|extreme) (shortness of breath|breathlessness)/i,
      /choking/i,
      /turning blue/i,
      /lips.*blue/i,
      /gasping for air/i,
    ],
    message: 'Sit upright, loosen tight clothing, and get emergency help immediately.',
  },
];

/**
 * Pure, synchronous, dependency-free check.
 * Always call this before showing AI output, and always show its result
 * even if a later AI call throws.
 */
export function detectEmergency(input: string): EmergencyFlag {
  if (!input || typeof input !== 'string') {
    return { triggered: false };
  }
  const text = input.toLowerCase();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          triggered: true,
          category: rule.category,
          matchedPhrase: match[0],
          message: rule.message,
        };
      }
    }
  }
  return { triggered: false };
}

export const EMERGENCY_NUMBERS_INDIA = [
  { label: 'National Emergency Number', number: '112' },
  { label: 'Ambulance', number: '108' },
  { label: 'Police', number: '100' },
  { label: 'Fire', number: '101' },
  { label: 'KIRAN Mental Health Helpline', number: '1800-599-0019' },
];
