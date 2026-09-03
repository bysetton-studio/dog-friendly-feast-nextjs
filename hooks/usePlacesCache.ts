import type { Place } from '@/types';

// No-op: place services are now server-side only; nothing to initialise client-side.
export function initServices(_map: unknown): void {}

export async function getPredictions(query: string): Promise<{ place_id: string; description: string; structured_formatting: { main_text: string; secondary_text: string } }[]> {
  const res = await fetch('/api/maps/autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: query }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.predictions ?? [];
}

export async function getPlaceDetails(placeId: string): Promise<Place> {
  const res = await fetch('/api/maps/details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId }),
  });

  if (!res.ok) return {};

  return res.json();
}
