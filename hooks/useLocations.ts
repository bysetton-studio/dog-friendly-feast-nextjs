import { useEffect, useState } from 'react';
import type { Location } from '@/types';

const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL!;

let cache: Location[] | null = null;
let inflight: Promise<Location[]> | null = null; // shared promise so duplicate calls wait on the same request
const subscribers = new Set<(locs: Location[]) => void>();

function fetchJSONP(url: string): Promise<Location[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');

    (window as unknown as Record<string, unknown>)[callbackName] = (data: Location[]) => {
      resolve(data);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
    };

    script.src = `${url}?callback=${callbackName}`;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
      reject(new Error('Failed to load locations'));
    };

    document.head.appendChild(script);
  });
}

export function invalidateLocationsCache(): void {
  cache = null;
  inflight = null;
}

export function addLocationToCache(newLocation: Location): void {
  cache = cache ? [...cache, newLocation] : [newLocation];
  subscribers.forEach((fn) => fn(cache!));
}

export function useLocations(): { locations: Location[]; loading: boolean; error: string | null } {
  const [locations, setLocations] = useState<Location[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    subscribers.add(setLocations);
    return () => { subscribers.delete(setLocations); };
  }, []);

  useEffect(() => {
    if (cache) {
      setLocations(cache);
      setLoading(false);
      return;
    }

    if (!inflight) {
      inflight = fetchJSONP(SHEET_URL);
    }

    inflight
      .then((data) => {
        cache = data;
        inflight = null;
        setLocations(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        inflight = null;
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { locations, loading, error };
}
