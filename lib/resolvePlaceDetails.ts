import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.GEOAPIFY_API_SECRET ?? '';

export type PlaceData = Record<string, unknown>;

/**
 * Resolves a place by name + address.
 * Step 1: Geocode search to get a place_id.
 * Step 2: Fetch full place details via /v2/place-details using that place_id.
 * Returns null if the cap is reached or the place cannot be found.
 */
export async function resolvePlaceDetails(name: string, address: string): Promise<PlaceData | null> {
  if (!(await canMakeMapsRequest('places_text_search'))) return null;

  // Step 1: geocode to get place_id
  const query = encodeURIComponent(`${name}, ${address}`);
  const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${query}&filter=countrycode:za&limit=1&apiKey=${API_KEY}`;
  const geocodeRes = await fetch(geocodeUrl);

  if (!geocodeRes.ok) {
    console.error('[Maps] Geoapify geocode search HTTP error', geocodeRes.status, await geocodeRes.text());
    return null;
  }

  const geocodeData = await geocodeRes.json();
  const geocodeFeature = geocodeData.features?.[0];
  if (!geocodeFeature) return null;

  const placeId: string | undefined = geocodeFeature.properties?.place_id;
  if (!placeId) return geoapifyPropsToPlace(geocodeFeature.properties);

  // Step 2: fetch full place details
  const detailsUrl = `https://api.geoapify.com/v2/place-details?id=${placeId}&features=details&apiKey=${API_KEY}`;
  const detailsRes = await fetch(detailsUrl);

  if (!detailsRes.ok) {
    console.error('[Maps] Geoapify place-details HTTP error', detailsRes.status, await detailsRes.text());
    return geoapifyPropsToPlace(geocodeFeature.properties);
  }

  const detailsData = await detailsRes.json();
  const detailsFeature = detailsData.features?.[0];
  if (!detailsFeature) return geoapifyPropsToPlace(geocodeFeature.properties);

  return geoapifyPropsToPlace(detailsFeature.properties);
}
