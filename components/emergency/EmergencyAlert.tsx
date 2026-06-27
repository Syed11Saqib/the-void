'use client';

import { motion } from 'framer-motion';
import { Phone, AlertTriangle, MapPin } from 'lucide-react';
import { EMERGENCY_NUMBERS_INDIA } from '@/lib/emergency/ruleEngine';
import type { EmergencyFlag } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function EmergencyAlert({
  flag,
  onFindHospital,
  onContinue,
}: {
  flag: EmergencyFlag;
  onFindHospital: () => void;
  onContinue: () => void;
}) {
  if (!flag.triggered) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-danger-700/40 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-live="assertive"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="w-full max-w-md rounded-xl3 bg-white p-6 shadow-glassLg"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger-500"
          >
            <AlertTriangle className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="font-display text-lg font-bold text-danger-600">Possible emergency</h2>
            <p className="text-xs text-foreground/50">Please act right away</p>
          </div>
        </div>

        <p className="mt-4 rounded-2xl bg-danger-50 p-4 text-sm text-danger-700">{flag.message}</p>

        <div className="mt-4 space-y-2">
          {EMERGENCY_NUMBERS_INDIA.map((n) => (
            <a
              key={n.number}
              href={`tel:${n.number}`}
              className="flex items-center justify-between rounded-2xl border border-danger-100 bg-danger-50/60 px-4 py-3 transition-colors hover:bg-danger-50 focus-ring"
            >
              <span className="text-sm font-medium text-foreground/80">{n.label}</span>
              <span className="flex items-center gap-1.5 font-display text-base font-bold text-danger-600">
                <Phone className="h-4 w-4" /> {n.number}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button variant="danger" size="lg" className="w-full" onClick={onFindHospital}>
            <MapPin className="h-5 w-5" />
            Find nearest government hospital
          </Button>
          <Button variant="ghost" className="w-full" onClick={onContinue}>
            Continue describing symptoms
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
