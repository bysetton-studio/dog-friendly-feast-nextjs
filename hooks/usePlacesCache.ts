import type { Prediction, Place } from '@/types';

// Module-level caches shared for the lifetime of the page
const predictionsCache = new Map<string, Prediction[]>();
const detailsCache = new Map<string, Place>();
const placeCache = new Map<string, Place>();

// No-op: new Places API doesn't require service initialization
export function initServices(_map: google.maps.Map | null): void {}

// Adapts the new google.maps.places.Place to the PlaceResult shape expected by the rest of the app
function placeToResult(place: google.maps.places.Place): google.maps.places.PlaceResult {
  return {
    place_id: place.id,
    name: place.displayName ?? undefined,
    formatted_address: place.formattedAddress ?? undefined,
    geometry: place.location
      ? { location: place.location, viewport: place.viewport ?? undefined }
      : undefined,
    address_components: place.addressComponents?.map((c) => ({
      long_name: c.longText,
      short_name: c.shortText,
      types: c.types,
    })),
    types: place.types ?? undefined,
    rating: place.rating ?? undefined,
    user_ratings_total: place.userRatingCount ?? undefined,
    formatted_phone_number: place.nationalPhoneNumber ?? undefined,
    website: place.websiteURI ?? undefined,
    opening_hours: place.regularOpeningHours
      ? ({ weekday_text: place.regularOpeningHours.weekdayDescriptions } as google.maps.places.PlaceOpeningHours)
      : undefined,
    photos: place.photos?.map((p) => ({
      getUrl: () => p.getURI(),
    })) as unknown as google.maps.places.PlacePhoto[] | undefined,
  } as google.maps.places.PlaceResult;
}

export async function getPredictions(query: string): Promise<Prediction[]> {
  const key = query.trim().toLowerCase();
  if (predictionsCache.has(key)) return predictionsCache.get(key)!;

  const { suggestions } =
    await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: query,
      includedRegionCodes: ['za'],
    });

  const predictions: Prediction[] = suggestions
    .flatMap((s) => (s.placePrediction ? [s.placePrediction] : []))
    .map((p) => ({
      place_id: p.placeId,
      description: p.text.text,
      structured_formatting: {
        main_text: p.mainText?.text ?? '',
        secondary_text: p.secondaryText?.text ?? '',
      },
    }));

  predictionsCache.set(key, predictions);
  return predictions;
}

export async function getPlaceDetails(placeId: string): Promise<Place> {
  if (detailsCache.has(placeId)) return detailsCache.get(placeId)!;

  const place = new window.google.maps.places.Place({ id: placeId });
  await place.fetchFields({
    fields: ['location', 'displayName', 'formattedAddress', 'addressComponents', 'types'],
  });

  const result = placeToResult(place) as Place;
  detailsCache.set(placeId, result);
  return result;
}

export async function findPlaceDetails(name: string, address: string): Promise<Place> {
  const key = `${name}|${address}`;
  if (placeCache.has(key)) return placeCache.get(key)!;

  const southAfrica = new window.google.maps.LatLngBounds(
    { lat: -34.8, lng: 16.5 },
    { lat: -22.1, lng: 32.9 }
  );

  const { places } = await window.google.maps.places.Place.searchByText({
    textQuery: `${name}, ${address}`,
    fields: [
      'id', 'location', 'displayName', 'formattedAddress', 'nationalPhoneNumber',
      'websiteURI', 'regularOpeningHours', 'rating', 'userRatingCount',
      'photos', 'addressComponents', 'types',
    ],
    locationBias: southAfrica,
    maxResultCount: 1,
  });

  if (!places[0]) throw new Error(`Could not find place: "${name}"`);

  const result = placeToResult(places[0]) as Place;
  placeCache.set(key, result);
  return result;
}
