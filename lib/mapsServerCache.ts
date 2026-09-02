import type { Prediction } from '@/types';

// Module-level caches — persist across all requests for the lifetime of the server process.
// Keyed by: query (autocomplete), placeId (details), "name|address" (text-search).
// Reset only on server restart, which is acceptable for place data that rarely changes.
//
// Place values are typed as Record<string, unknown> because the server returns plain
// { lat, lng } objects rather than google.maps.LatLng instances.

export const predictionsCache = new Map<string, Prediction[]>();
export const detailsCache = new Map<string, Record<string, unknown>>();
export const placeCache = new Map<string, Record<string, unknown>>();

// Photo cache entries include an expiry because Google's signed URLs expire after ~1 hour.
// We use 50 minutes to be safe.
const PHOTO_TTL_MS = 50 * 60 * 1000;

interface PhotoEntry {
  url: string;
  expiresAt: number;
}

const photoCache = new Map<string, PhotoEntry>();

export function getCachedPhotoUrl(name: string): string | null {
  const entry = photoCache.get(name);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    photoCache.delete(name);
    return null;
  }
  return entry.url;
}

export function setCachedPhotoUrl(name: string, url: string): void {
  photoCache.set(name, { url, expiresAt: Date.now() + PHOTO_TTL_MS });
}
