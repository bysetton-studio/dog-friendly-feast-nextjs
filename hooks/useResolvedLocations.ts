import { useEffect, useState } from 'react';
import type { ResolvedLocation } from '@/types';

interface Result {
  resolved: ResolvedLocation[];
  loading: boolean;
  capReached: boolean;
  fetchResolvedLocations: () => Promise<void>;
}

let cache: ResolvedLocation[] | null = null;
let cachedCapReached = false;
const subscribers = new Set<(locs: ResolvedLocation[]) => void>();

export function addResolvedLocation(location: ResolvedLocation): void {
  cache = cache ? [location, ...cache] : [location];
  subscribers.forEach((fn) => fn(cache!));
}

export function useResolvedLocations(): Result {
  const [resolved, setResolved] = useState<ResolvedLocation[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);
  const [capReached, setCapReached] = useState(cachedCapReached);

  async function fetchResolvedLocations(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch('/api/locations');
      const data: { resolved: ResolvedLocation[]; capReached: boolean } = await res.json();
      cache = data.resolved ?? [];
      cachedCapReached = data.capReached ?? false;
      subscribers.forEach((fn) => fn(cache!));
      setCapReached(cachedCapReached);
    } catch {
      // keep existing state on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    subscribers.add(setResolved);
    if (cache !== null) {
      setResolved(cache);
      setCapReached(cachedCapReached);
      setLoading(false);
    } else {
      fetchResolvedLocations();
    }
    return () => { subscribers.delete(setResolved); };
  }, []);

  return { resolved, loading, capReached, fetchResolvedLocations };
}
