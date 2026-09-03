import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

export type PlaceData = Record<string, unknown>;

/**
 * Resolves a place by name + address via the Geoapify Geocoding Search API.
 * Returns null if the cap is reached or the place cannot be found.
 */
export async function resolvePlaceDetails(name: string, address: string): Promise<PlaceData | null> {
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

  return geoapifyPropsToPlace(feature.properties);
}
