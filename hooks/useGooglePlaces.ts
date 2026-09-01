import { useEffect, useState } from 'react';

const SCRIPT_ID = 'google-maps-script';

// Module-level state shared across all hook instances
let isLoaded = false;
const listeners = new Set<() => void>();

function notifyAll(): void {
  isLoaded = true;
  listeners.forEach((fn) => fn());
}

export function useGooglePlaces(apiKey: string): boolean {
  const [ready, setReady] = useState(() => isLoaded);

  useEffect(() => {
    if (isLoaded) {
      setReady(true);
      return;
    }

    const notify = () => setReady(true);
    listeners.add(notify);

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = notifyAll;
      document.head.appendChild(script);
    }

    return () => {
      listeners.delete(notify);
    };
  }, [apiKey]);

  return ready;
}
