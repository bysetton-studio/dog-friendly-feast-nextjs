import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPlace, setCachedPlace } from '@/lib/mapsServerCache';

const API_KEY = process.env.GOOGLE_MAPS_API_SECRET ?? "";

const FIELD_MASK = [
  'places.id', 'places.location', 'places.displayName', 'places.formattedAddress',
  'places.nationalPhoneNumber', 'places.websiteUri', 'places.regularOpeningHours',
  'places.rating', 'places.userRatingCount', 'places.photos',
  'places.addressComponents', 'places.types',
].join(',');

const LOCATION_BIAS = {
  rectangle: {
    low: { latitude: -34.8, longitude: 16.5 },
    high: { latitude: -22.1, longitude: 32.9 },
  },
};

interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

interface Photo {
  name: string;
}

export type PlaceData = Record<string, unknown>;

/**
 * Resolves a place by name + address via the Google Places Text Search API.
 * Checks cache first; only calls Google on a cache miss.
 * Returns null if the cap is reached or the place cannot be found.
 */
export async function resolvePlaceDetails(name: string, address: string): Promise<PlaceData | null> {
  const cacheKey = `${name}|${address}`;

  const cached = await getCachedPlace(cacheKey);
  if (cached) return cached;

  if (!(await canMakeMapsRequest('places_text_search'))) {
    return null;
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${name}, ${address}`,
      locationBias: LOCATION_BIAS,
      maxResultCount: 1,
    }),
  });

  if (!res.ok) {
    console.error('[Maps] Text Search HTTP error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const p = data.places?.[0];
  if (!p) return null;

  const place: PlaceData = {
    place_id: p.id,
    name: p.displayName?.text,
    formatted_address: p.formattedAddress,
    geometry: p.location
      ? { location: { lat: p.location.latitude, lng: p.location.longitude } }
      : undefined,
    address_components: (p.addressComponents ?? []).map((c: AddressComponent) => ({
      long_name: c.longText,
      short_name: c.shortText,
      types: c.types,
    })),
    types: p.types,
    rating: p.rating,
    user_ratings_total: p.userRatingCount,
    formatted_phone_number: p.nationalPhoneNumber,
    website: p.websiteUri,
    opening_hours: p.regularOpeningHours?.weekdayDescriptions
      ? { weekday_text: p.regularOpeningHours.weekdayDescriptions }
      : undefined,
    photos: (p.photos ?? []).slice(0, 1).map((photo: Photo) => ({
      photoReference: photo.name,
    })),
  };

  await setCachedPlace(cacheKey, place);
  return place;
}
