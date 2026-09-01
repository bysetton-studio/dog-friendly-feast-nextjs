export interface Location {
  address: string;
  adminApproved: boolean | string;
  [key: string]: unknown;
}

export interface Place {
  formatted_address?: string;
  types?: string[];
  geometry?: google.maps.places.PlaceResult['geometry'];
  [key: string]: unknown;
}

export interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}
