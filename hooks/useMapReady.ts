import { useEffect, useState } from 'react';

/**
 * Returns true once the component has mounted on the client.
 * Used to gate map initialization so it only runs in the browser.
 */
export function useMapReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return ready;
}
