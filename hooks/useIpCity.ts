import { useEffect, useState } from 'react';

const CACHE_KEY = 'ip_city';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface IpCity {
  city: string;
  lat: number;
  lng: number;
}

export function useIpCity(): IpCity | null {
  const [result, setResult] = useState<IpCity | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { value, expires } = JSON.parse(raw);
      if (Date.now() < expires) return value;
      localStorage.removeItem(CACHE_KEY);
    } catch {/* ignore */}
    return null;
  });

  useEffect(() => {
    if (result) return;
    fetch('/api/city')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.city !== 'string') return;
        if (typeof data?.lat !== 'number' || typeof data?.lng !== 'number') return;
        const value: IpCity = { city: data.city, lat: data.lat, lng: data.lng };
        setResult(value);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value,
          expires: Date.now() + CACHE_TTL_MS,
        }));
      })
      .catch(() => {/* silently ignore */});
  }, []);

  return result;
}
