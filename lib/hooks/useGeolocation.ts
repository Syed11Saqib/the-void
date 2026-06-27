'use client';

import { useCallback, useState } from 'react';
import type { Coordinates } from '@/lib/types';
import { geocodeCity } from '@/lib/services/overpass';

interface UseGeolocationResult {
  coords: Coordinates | null;
  status: 'idle' | 'locating' | 'granted' | 'denied' | 'error';
  errorMessage: string | null;
  requestLocation: () => void;
  searchCity: (city: string) => Promise<boolean>;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<UseGeolocationResult['status']>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setErrorMessage('Location is not supported on this device.');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus('granted');
      },
      (err) => {
        setStatus('denied');
        setErrorMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please search by city instead.'
            : 'Could not get your location. Please search by city instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const searchCity = useCallback(async (city: string): Promise<boolean> => {
    setStatus('locating');
    setErrorMessage(null);
    const result = await geocodeCity(city);
    if (result) {
      setCoords(result);
      setStatus('granted');
      return true;
    }
    setStatus('error');
    setErrorMessage(`Could not find "${city}". Try a nearby major city.`);
    return false;
  }, []);

  return { coords, status, errorMessage, requestLocation, searchCity };
}
