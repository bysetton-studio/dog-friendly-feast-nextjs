import { useEffect, useState } from 'react';

const SCRIPT_ID = 'google-maps-script';
const CALLBACK_NAME = '__googleMapsInit';

// Module-level state shared across all hook instances
let isLoaded = false;
const listeners = new Set<() => void>();

function notifyAll(): void {
  isLoaded = true;
  listeners.forEach((fn) => fn());
  delete (window as unknown as Record<string, unknown>)[CALLBACK_NAME];
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
      // Must be set before the script tag is added so the callback is available when the API initialises
      (window as unknown as Record<string, unknown>)[CALLBACK_NAME] = notifyAll;
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      // loading=async requires a callback= param; onload fires too early with this mode
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async&callback=${CALLBACK_NAME}`;
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      listeners.delete(notify);
    };
  }, [apiKey]);

  return ready;
}
