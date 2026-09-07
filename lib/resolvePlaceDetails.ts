import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.GEOAPIFY_API_SECRET ?? '';

export type PlaceData = Record<string, unknown>;

/**
 * Fetches full place details from Geoapify using a known place_id.
 * Returns null if the cap is reached or the place cannot be found.
 */
export async function resolvePlaceDetails(placeId: string): Promise<PlaceData | null> {
  if (!(await canMakeMapsRequest('places_text_search'))) return null;

  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(placeId)}&features=details&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify place-details HTTP error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return geoapifyPropsToPlace(feature.properties);
}
