import type { Prediction } from '@/types';

// Module-level caches — persist for the lifetime of the server process.
// Fast (no DB round-trip) and sufficient since place data rarely changes.
// Reset on server restart, at which point Google is called once to re-warm.

const predictionsCache = new Map<string, Prediction[]>();
const detailsCache = new Map<string, Record<string, unknown>>();
const placeCache = new Map<string, Record<string, unknown>>();

// Photo URLs get a TTL because Google's signed URLs expire after ~1 hour.
const PHOTO_TTL_MS = 50 * 60 * 1000;
const photoCache = new Map<string, { url: string; expiresAt: number }>();

export async function getCachedPredictions(query: string): Promise<Prediction[] | null> {
  return predictionsCache.get(query) ?? null;
}
export async function setCachedPredictions(query: string, predictions: Prediction[]): Promise<void> {
  predictionsCache.set(query, predictions);
}

export async function getCachedDetails(placeId: string): Promise<Record<string, unknown> | null> {
  return detailsCache.get(placeId) ?? null;
}
export async function setCachedDetails(placeId: string, place: Record<string, unknown>): Promise<void> {
  detailsCache.set(placeId, place);
}

export async function getCachedPlace(cacheKey: string): Promise<Record<string, unknown> | null> {
  return placeCache.get(cacheKey) ?? null;
}
export async function setCachedPlace(cacheKey: string, place: Record<string, unknown>): Promise<void> {
  placeCache.set(cacheKey, place);
}

export async function getCachedPhotoUrl(name: string): Promise<string | null> {
  const entry = photoCache.get(name);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    photoCache.delete(name);
    return null;
  }
  return entry.url;
}
export async function setCachedPhotoUrl(name: string, url: string): Promise<void> {
  photoCache.set(name, { url, expiresAt: Date.now() + PHOTO_TTL_MS });
}
