import { useEffect, useState } from 'react';
import type { Location } from '@/types';

let cache: Location[] | null = null;
let inflight: Promise<Location[]> | null = null;
const subscribers = new Set<(locs: Location[]) => void>();

async function fetchLocations(): Promise<Location[]> {
  const res = await fetch('/api/locations');
  if (!res.ok) throw new Error('Failed to load locations');
  return res.json();
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
      inflight = fetchLocations();
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
