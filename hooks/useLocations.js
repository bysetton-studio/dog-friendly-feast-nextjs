import { useEffect, useState } from 'react';

const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL;

let cache = null;
let inflight = null; // shared promise so duplicate calls wait on the same request
const subscribers = new Set();

function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');

    window[callbackName] = (data) => {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };

    script.src = `${url}?callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error('Failed to load locations'));
    };

    document.head.appendChild(script);
  });
}

export function invalidateLocationsCache() {
  cache = null;
  inflight = null;
}

export function addLocationToCache(newLocation) {
  cache = cache ? [...cache, newLocation] : [newLocation];
  subscribers.forEach((fn) => fn(cache));
}

export function useLocations() {
  const [locations, setLocations] = useState(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    subscribers.add(setLocations);
    return () => subscribers.delete(setLocations);
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
      .catch((err) => {
        inflight = null;
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { locations, loading, error };
}
