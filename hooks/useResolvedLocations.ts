import { useEffect, useState } from 'react';
import type { ResolvedLocation } from '@/types';

export function useResolvedLocations(): { resolved: ResolvedLocation[]; loading: boolean } {
  const [resolved, setResolved] = useState<ResolvedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data: ResolvedLocation[]) => setResolved(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { resolved, loading };
}
