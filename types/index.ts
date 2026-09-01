export interface Location {
  name: string;
  address: string;
  friendly: boolean | string;
  adminApproved: boolean | string;
}

export interface Place {
  formatted_address?: string;
  types?: string[];
  geometry?: google.maps.places.PlaceResult['geometry'];
  [key: string]: unknown;
}

export interface ResolvedLocation {
  name: string;
  address: string;
  isFriendly: boolean;
  isApproved: boolean;
  place: google.maps.places.PlaceResult;
  city: string;
  suburb: string | null;
}

export interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}
