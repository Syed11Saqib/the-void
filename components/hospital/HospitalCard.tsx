'use client';

import { motion } from 'framer-motion';
import { Navigation, Phone, MapPin, Building2 } from 'lucide-react';
import type { Hospital } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function HospitalCard({ hospital, index }: { hospital: Hospital; index: number }) {
  const mapsUrl = `https://www.openstreetmap.org/directions?to=${hospital.lat}%2C${hospital.lon}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="p-1">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold leading-snug text-foreground">
                  {hospital.name}
                </h3>
                {hospital.address && (
                  <p className="mt-0.5 text-xs text-foreground/50">{hospital.address}</p>
                )}
              </div>
            </div>
            {hospital.type === 'government' && <Badge variant="low">Govt.</Badge>}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-foreground/55">
            <MapPin className="h-3.5 w-3.5" />
            {hospital.distanceKm != null ? `${hospital.distanceKm} km away` : 'Distance unknown'}
          </div>

          <div className="flex gap-2">
            <Button asChild variant="sky" size="sm" className="flex-1">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" /> Navigate
              </a>
            </Button>
            {hospital.phone && (
              <Button asChild variant="outline" size="sm" className="flex-1">
                <a href={`tel:${hospital.phone}`}>
                  <Phone className="h-4 w-4" /> Call
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
