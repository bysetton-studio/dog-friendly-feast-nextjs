import type { Prediction, Place } from '@/types';

// Module-level caches shared for the lifetime of the page
const predictionsCache = new Map<string, Prediction[]>();
const detailsCache = new Map<string, Place>();
const placeCache = new Map<string, Place>();

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;

export function initServices(map: google.maps.Map | null): void {
  if (!autocompleteService) {
    autocompleteService = new window.google.maps.places.AutocompleteService();
  }
  if (!placesService && map) {
    placesService = new window.google.maps.places.PlacesService(map);
  }
}

export function getPredictions(query: string): Promise<Prediction[]> {
  const key = query.trim().toLowerCase();
  if (predictionsCache.has(key)) {
    return Promise.resolve(predictionsCache.get(key)!);
  }

  return new Promise((resolve) => {
    autocompleteService!.getPlacePredictions(
      { input: query, componentRestrictions: { country: 'za' } },
      (results, status) => {
        const predictions =
          status === window.google.maps.places.PlacesServiceStatus.OK
            ? (results as unknown as Prediction[])
            : [];
        predictionsCache.set(key, predictions);
        resolve(predictions);
      }
    );
  });
}

export function getPlaceDetails(placeId: string): Promise<Place> {
  if (detailsCache.has(placeId)) {
    return Promise.resolve(detailsCache.get(placeId)!);
  }

  return new Promise((resolve, reject) => {
    placesService!.getDetails(
      { placeId, fields: ['geometry', 'name', 'formatted_address', 'address_components', 'types'] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          detailsCache.set(placeId, place as Place);
          resolve(place as Place);
        } else {
          reject(new Error(`PlacesService failed: ${status}`));
        }
      }
    );
  });
}

export function findPlaceDetails(name: string, address: string): Promise<Place> {
  const key = `${name}|${address}`;
  if (placeCache.has(key)) {
    return Promise.resolve(placeCache.get(key)!);
  }

  return new Promise((resolve, reject) => {
    const southAfrica = new window.google.maps.LatLngBounds(
      { lat: -34.8, lng: 16.5 },
      { lat: -22.1, lng: 32.9 }
    );

    placesService!.findPlaceFromQuery(
      {
        query: `${name}, ${address}`,
        fields: ['place_id', 'geometry', 'name'],
        locationBias: southAfrica,
      },
      (results, status) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results?.[0]) {
          reject(new Error(`Could not find place: "${name}"`));
          return;
        }

        const placeId = results[0].place_id!;

        placesService!.getDetails(
          {
            placeId,
            fields: [
              'place_id', 'name', 'formatted_address', 'formatted_phone_number',
              'website', 'opening_hours', 'rating', 'user_ratings_total',
              'photos', 'geometry', 'address_components', 'types',
            ],
          },
          (place, detailStatus) => {
            if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
              placeCache.set(key, place as Place);
              resolve(place as Place);
            } else {
              reject(new Error(`getDetails failed for "${name}": ${detailStatus}`));
            }
          }
        );
      }
    );
  });
}
