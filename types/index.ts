export interface Location {
  name: string;
  address: string;
  friendly: boolean | string;
  adminApproved: boolean | string;
}

export interface Place {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: {
    location: { lat: number; lng: number };
  };
  address_components?: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  types?: string[];
  [key: string]: unknown;
}

export interface ResolvedLocation {
  name: string;
  address: string;
  isFriendly: boolean;
  isApproved: boolean;
  place: Place;
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
