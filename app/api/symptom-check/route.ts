import { NextRequest, NextResponse } from 'next/server';
import { analyzeSymptoms } from '@/lib/services/aiService';
import type { ChatMessage, Profile } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile: Profile = body.profile;
    const messages: ChatMessage[] = body.messages;
    const followUpCount: number = body.followUpCount ?? 0;

    if (!profile || !messages?.length) {
      return NextResponse.json({ error: 'Missing profile or messages' }, { status: 400 });
    }

    const result = await analyzeSymptoms({ profile, messages, followUpCount });
    return NextResponse.json(result);
  } catch (err) {
    console.error('symptom-check error', err);
    const message = err instanceof Error ? err.message : 'AI_UNAVAILABLE';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
