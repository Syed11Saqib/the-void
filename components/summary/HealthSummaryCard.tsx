'use client';

import { motion } from 'framer-motion';
import { MapPin, Droplets, Bed, Soup, Snowflake, Flame, Moon, AlertCircle, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { HealthSummary } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { LucideIcon } from 'lucide-react';

const HOME_CARE_ICONS: Record<string, LucideIcon> = {
  water: Droplets,
  rest: Bed,
  hydration: Droplets,
  cold: Snowflake,
  warm: Flame,
  food: Soup,
  sleep: Moon,
};

function iconFor(text: string): LucideIcon {
  const key = Object.keys(HOME_CARE_ICONS).find((k) => text.toLowerCase().includes(k));
  return key ? HOME_CARE_ICONS[key]! : Droplets;
}

const URGENCY_LABEL: Record<HealthSummary['urgency'], string> = {
  low: 'Low urgency',
  medium: 'Medium urgency',
  high: 'High urgency',
  emergency: 'Emergency',
};

export function HealthSummaryCard({ summary }: { summary: HealthSummary }) {
  const router = useRouter();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-xs text-foreground/50">Health summary for</p>
            <CardTitle>{summary.patientName}</CardTitle>
          </div>
          <Badge variant={summary.urgency}>{URGENCY_LABEL[summary.urgency]}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <section>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Possible cause (not a diagnosis)
            </h4>
            <p className="text-sm text-foreground/80">{summary.possibleCause}</p>
          </section>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/45">Home care</h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {summary.homeCare.map((item, i) => {
                const Icon = iconFor(item);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-2xl bg-mint-50 px-3 py-2.5 text-xs font-medium text-mint-800"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-mint-500" />
                    {item}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-sky-50 p-4">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <Stethoscope className="h-3.5 w-3.5" /> Doctor recommendation
            </h4>
            <p className="text-sm text-sky-800">{summary.doctorRecommendation}</p>
          </section>

          {summary.emergencySigns.length > 0 && (
            <section className="rounded-2xl bg-danger-50 p-4">
              <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-danger-600">
                <AlertCircle className="h-3.5 w-3.5" /> Seek emergency care if you notice
              </h4>
              <ul className="space-y-1 text-sm text-danger-700">
                {summary.emergencySigns.map((sign, i) => (
                  <li key={i}>• {sign}</li>
                ))}
              </ul>
            </section>
          )}

          <Button variant="sky" className="w-full" onClick={() => router.push('/hospitals')}>
            <MapPin className="h-5 w-5" />
            Find nearest government hospital
          </Button>

          <p className="text-center text-xs font-medium text-foreground/40">{summary.disclaimer}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
