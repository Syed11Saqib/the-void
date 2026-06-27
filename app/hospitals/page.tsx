'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Search, LocateFixed } from 'lucide-react';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { findNearbyHospitals } from '@/lib/services/overpass';
import type { Hospital } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HospitalCard } from '@/components/hospital/HospitalCard';

export default function HospitalsPage() {
  const router = useRouter();
  const geo = useGeolocation();
  const [city, setCity] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    geo.requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (geo.status === 'granted' && geo.coords) {
      void loadHospitals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status, geo.coords]);

  async function loadHospitals() {
    if (!geo.coords) return;
    setFetching(true);
    setFetchError(null);
    try {
      const results = await findNearbyHospitals(geo.coords);
      setHospitals(results);
      if (results.length === 0) {
        setFetchError('No hospitals found nearby. Try a different city or widen your search.');
      }
    } catch {
      setFetchError('Could not load hospitals right now. Please check your connection and try again.');
    } finally {
      setFetching(false);
    }
  }

  async function handleCitySearch() {
    if (!city.trim()) return;
    const ok = await geo.searchCity(city.trim());
    if (ok) await loadHospitals();
  }

  return (
    <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8 sm:py-8">
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.push('/home')}
          className="flex h-9 w-9 items-center justify-center rounded-full glass shadow-soft focus-ring"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-foreground/70" />
        </button>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">Nearest Government Clinic</h1>
          <p className="text-xs text-foreground/50">Found via OpenStreetMap</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl py-6">
        {(geo.status === 'denied' || geo.status === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-2xl glass p-4"
          >
            <p className="mb-3 text-sm text-foreground/70">{geo.errorMessage}</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              />
              <Button onClick={handleCitySearch}>
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
          </motion.div>
        )}

        {geo.status === 'locating' && (
          <div className="flex flex-col items-center gap-3 py-16 text-foreground/50">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
              <LocateFixed className="h-7 w-7 text-mint-500" />
            </motion.div>
            <p className="text-sm">Finding your location…</p>
          </div>
        )}

        {fetching && (
          <div className="flex flex-col items-center gap-3 py-16 text-foreground/50">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>
              <MapPin className="h-7 w-7 text-sky-500" />
            </motion.div>
            <p className="text-sm">Looking up nearby hospitals…</p>
          </div>
        )}

        {fetchError && !fetching && (
          <p className="mb-4 rounded-2xl bg-warn-50 px-4 py-3 text-center text-sm text-warn-600">{fetchError}</p>
        )}

        {!fetching && hospitals.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {hospitals.map((h, i) => (
              <HospitalCard key={h.id} hospital={h} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
