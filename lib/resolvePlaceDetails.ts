import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPlace, setCachedPlace } from '@/lib/mapsServerCache';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

export type PlaceData = Record<string, unknown>;

/**
 * Resolves a place by name + address via the Geoapify Geocoding Search API.
 * Checks cache first; only calls Geoapify on a cache miss.
 * Returns null if the cap is reached or the place cannot be found.
 */
export async function resolvePlaceDetails(name: string, address: string): Promise<PlaceData | null> {
  const cacheKey = `${name}|${address}`;

  const cached = await getCachedPlace(cacheKey);
  if (cached) return cached;

  if (!(await canMakeMapsRequest('places_text_search'))) return null;

  const query = encodeURIComponent(`${name}, ${address}`);
  const url = `https://api.geoapify.com/v1/geocode/search?text=${query}&filter=countrycode:za&limit=1&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify geocode search HTTP error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  const place = geoapifyPropsToPlace(feature.properties);
  await setCachedPlace(cacheKey, place);
  return place;
}
