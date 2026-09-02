import { useEffect, useState } from 'react';
import type { ResolvedLocation } from '@/types';

interface Result {
  resolved: ResolvedLocation[];
  loading: boolean;
  capReached: boolean;
}

export function useResolvedLocations(): Result {
  const [resolved, setResolved] = useState<ResolvedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [capReached, setCapReached] = useState(false);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data: { resolved: ResolvedLocation[]; capReached: boolean }) => {
        setResolved(data.resolved ?? []);
        setCapReached(data.capReached ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { resolved, loading, capReached };
}
