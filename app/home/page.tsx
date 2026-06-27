'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Stethoscope, MapPin, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfiles } from '@/lib/hooks/useProfiles';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const { activeProfile, loading } = useProfiles(userId ?? '');

  useEffect(() => {
    if (authLoading || loading) return;
    if (!activeProfile) {
      router.replace('/profiles');
    }
  }, [activeProfile, authLoading, loading, router]);

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-foreground/50">Loading…</div>;
  }

  if (!activeProfile) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col px-6 py-8 sm:py-12">
      <header className="flex items-center justify-between">
        <button
          onClick={() => router.push('/profiles')}
          className="flex items-center gap-2 rounded-full glass px-3 py-1.5 shadow-soft focus-ring"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-base"
            style={{ background: `${activeProfile.avatarColor}22` }}
          >
            {activeProfile.avatarEmoji}
          </span>
          <span className="text-sm font-medium text-foreground/80">{activeProfile.name}</span>
        </button>
        <button
          onClick={() => router.push('/profiles')}
          className="flex h-9 w-9 items-center justify-center rounded-full glass text-foreground/60 shadow-soft focus-ring"
          aria-label="Switch profile"
        >
          <UserRound className="h-4 w-4" />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Hi {activeProfile.name.split(' ')[0]}, how can we help?
          </h1>
          <p className="mt-2 text-sm text-foreground/55">Choose what you&apos;d like to do</p>
        </motion.div>

        <div className="grid w-full max-w-xl grid-cols-1 gap-5 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card
              onClick={() => router.push('/symptom-checker')}
              className="group flex h-56 cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-glassLg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-500 shadow-soft transition-transform group-hover:scale-105">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Symptom Checker</h2>
                <p className="mt-1 text-sm text-foreground/55">Describe how you feel</p>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card
              onClick={() => router.push('/hospitals')}
              className="group flex h-56 cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center transition-transform hover:-translate-y-1 hover:shadow-glassLg"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 shadow-soft transition-transform group-hover:scale-105">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">Nearest Government Clinic</h2>
                <p className="mt-1 text-sm text-foreground/55">Find help close to you</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="flex items-center justify-center gap-1 text-xs text-foreground/40">
        <span>This is not a medical diagnosis.</span>
      </footer>
    </main>
  );
}
