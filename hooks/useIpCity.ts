import { useEffect, useState } from 'react';

const CACHE_KEY = 'ip_city';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useIpCity(): string | null {
  const [city, setCity] = useState<string | null>(() => {
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
    if (city) return; // already have a cached value
    fetch('/api/city')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.city !== 'string') return;
        setCity(data.city);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          value: data.city,
          expires: Date.now() + CACHE_TTL_MS,
        }));
      })
      .catch(() => {/* silently ignore */});
  }, []);

  return city;
}
