# DR.VOID — Healthcare Triage Assistant (MVP)

A calm, mobile-first healthcare assistant for Tier-2/Tier-3 users. **Not a medical diagnosis tool.**

## What's implemented

- Google login (Supabase Auth) + Guest login
- Netflix-style profile selection — create / edit / delete, temporary (session-only) profiles
- Home screen with two actions: Symptom Checker, Nearest Government Clinic
- Symptom Checker: text + voice input (Web Speech API), Pixar-style animated SVG assistant face, up to 2 follow-up questions, text-to-speech replies
- **Independent emergency rule engine** — runs before any AI call and works even if the AI API is down. Detects chest pain, stroke, severe bleeding, poisoning, overdose, suicide risk, breathing difficulty.
- AI-generated health summary (urgency, possible cause framed as non-diagnostic, home-care only, doctor recommendation, emergency signs) via OpenRouter, with a hardcoded safety system prompt + output sanitizer that strips anything resembling a dosage instruction
- Hospital finder via OpenStreetMap Overpass API, GPS with manual city search fallback (Nominatim geocoding), government-hospital tagging heuristic
- Glassmorphism / Apple-inspired UI, Framer Motion throughout, fully responsive
- Vitest unit tests for the rule engine + validation; Playwright e2e smoke test for the critical guest→profile→emergency flow

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev
```

The app **runs in Guest mode with zero keys configured** — profiles are stored in localStorage/sessionStorage, and the emergency rule engine and hospital finder both work with no keys at all (Overpass/Nominatim are free, keyless). You only need keys for Google login and AI-generated summaries.

## Where to get each API key

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [supabase.com](https://supabase.com) → New Project (free tier) → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role" key. Server-only, never expose to the client. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Client ID. Add the redirect URI Supabase shows you under Authentication → Providers → Google. |
| `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) → sign up → Keys → Create Key. Free models available (default: `meta-llama/llama-3.1-8b-instruct:free`). |
| `NEXT_PUBLIC_OVERPASS_URL` | No key needed — public Overpass API, default already set in `.env.example`. |

Run `supabase/schema.sql` in the Supabase SQL editor to create the `profiles` and `symptom_sessions` tables with row-level security.

## Testing

```bash
npm run test        # unit tests (Vitest)
npm run test:e2e    # e2e (Playwright) — requires the dev server
```

## Architecture notes

- `lib/emergency/ruleEngine.ts` is intentionally dependency-free and synchronous — it is the safety backstop and must never depend on the AI service.
- `lib/services/aiService.ts` enforces the no-diagnosis / no-dosage rules both via a strict system prompt **and** a post-hoc sanitizer that strips anything matching a dosage pattern, in case the model slips.
- `lib/store/profileStore.ts` is local-first (localStorage/sessionStorage) so the app works immediately without Supabase configured; swap its internals for Supabase queries when ready — each method maps 1:1 to a future query.
- This is an MVP scaffold, not a finished production system: error boundaries, full Supabase profile sync, server-side rate limiting, and broader test coverage are the natural next steps.
