import type { Prediction, Place } from '@/types';

// Module-level caches shared for the lifetime of the page
const predictionsCache = new Map<string, Prediction[]>();
const detailsCache = new Map<string, Place>();
const placeCache = new Map<string, Place>();

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;

export function initServices(map: google.maps.Map): void {
  // TODO
}

export function getPredictions(query: string): Promise<Prediction[]> {
  // TODO
  return Promise.resolve([]);
}

export function getPlaceDetails(placeId: string): Promise<Place> {
  // TODO
  return Promise.resolve({});
}

export function findPlaceDetails(name: string, address: string): Promise<Place> {
  // TODO
  return Promise.resolve({});
}
