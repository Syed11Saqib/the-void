'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, Chrome, UserRound, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseBrowserClient } from '@/lib/services/supabaseClient';

type Mode = 'choices' | 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('choices');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleGoogleLogin() {
    if (!isSupabaseConfigured()) {
      alert('Google login requires Supabase setup. See .env.example for the keys you need to add.');
      return;
    }
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/profiles` },
    });
  }

  function handleGuestLogin() {
    const guestId = `guest_${crypto.randomUUID()}`;
    window.localStorage.setItem('drvoid:guest_id', guestId);
    router.push('/profiles');
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured()) {
      setError('Email login requires Supabase setup. See .env.example for the keys you need to add.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/profiles` },
        });
        if (signUpError) throw signUpError;
        setNotice('Account created. Check your email to confirm, then sign in.');
        setMode('signin');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        router.push('/profiles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function backToChoices() {
    setMode('choices');
    setError(null);
    setNotice(null);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-mint-200 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-sky-200 opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-mint-100 opacity-50 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center"
      >
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-500 shadow-glassLg">
          <Stethoscope className="h-8 w-8 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          DR.VOID
        </h1>
        <p className="mt-2 max-w-xs text-center text-sm text-foreground/60">
          Your calm guide to care. Understand symptoms, gauge urgency, find help nearby.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="z-10 mt-10 w-full max-w-sm"
      >
        <Card className="p-2">
          <CardContent className="flex flex-col gap-3 p-4">
            <AnimatePresence mode="wait">
              {mode === 'choices' ? (
                <motion.div
                  key="choices"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <Button size="lg" className="w-full" onClick={handleGoogleLogin}>
                    <Chrome className="h-5 w-5" />
                    Continue with Google
                  </Button>
                  <Button size="lg" variant="sky" className="w-full" onClick={() => setMode('signin')}>
                    <Mail className="h-5 w-5" />
                    Continue with Email
                  </Button>
                  <Button size="lg" variant="secondary" className="w-full" onClick={handleGuestLogin}>
                    <UserRound className="h-5 w-5" />
                    Continue as Guest
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleEmailSubmit}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="mt-1.5"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="mt-1.5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  {error && <p className="text-xs text-danger-600">{error}</p>}
                  {notice && <p className="text-xs text-mint-700">{notice}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : mode === 'signup' ? (
                      'Create account'
                    ) : (
                      'Sign in'
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'signin' : 'signup');
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-center text-xs text-mint-700 underline-offset-2 hover:underline focus-ring"
                  >
                    {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>

                  <button
                    type="button"
                    onClick={backToChoices}
                    className="text-center text-xs text-foreground/45 hover:text-foreground/65 focus-ring"
                  >
                    ← Back
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-foreground/50">
          <ShieldCheck className="h-4 w-4 text-mint-500" />
          This is not a medical diagnosis tool.
        </div>
      </motion.div>
    </main>
  );
}
