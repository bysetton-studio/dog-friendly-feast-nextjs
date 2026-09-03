interface AddressComponent {
  long_name: string;
  types: string[];
}

const CITY_TYPES = ['locality', 'administrative_area_level_2', 'administrative_area_level_1'];
const SUBURB_TYPES = ['sublocality_level_1', 'sublocality', 'neighborhood', 'locality'];

export function getCity(addressComponents: AddressComponent[] | undefined): string {
  for (const type of CITY_TYPES) {
    const component = addressComponents?.find((c) => c.types?.includes(type));
    if (component) return component.long_name;
  }
  return 'Other';
}

export function getSuburb(addressComponents: AddressComponent[] | undefined): string | null {
  for (const type of SUBURB_TYPES) {
    const component = addressComponents?.find((c) => c.types?.includes(type));
    if (component) return component.long_name;
  }
  return null;
}

/**
 * Maps Geoapify category strings (e.g. "catering.restaurant") to the Google-style
 * place type strings used by TYPE_FILTERS (e.g. "restaurant").
 */
export function normalizeGeoapifyCategories(categories: string[] | undefined): string[] {
  if (!categories) return [];
  const mapped: string[] = [];
  for (const cat of categories) {
    if (cat.includes('restaurant') || cat.includes('fast_food')) mapped.push('restaurant');
    else if (cat.includes('cafe') || cat.includes('coffee') || cat.includes('bakery')) mapped.push('cafe');
    else if (cat.includes('bar') || cat.includes('pub')) mapped.push('bar');
    else if (cat.includes('park') || cat.startsWith('natural.')) mapped.push('park');
    else if (cat.includes('shopping_mall') || cat.includes('mall')) mapped.push('shopping_mall');
    else if (cat.includes('supermarket')) mapped.push('supermarket');
    else if (cat.includes('convenience')) mapped.push('convenience_store');
  }
  return [...new Set(mapped)];
}

interface GeoapifyProps {
  place_id?: string;
  name?: string;
  address_line1?: string;
  address_line2?: string;
  formatted?: string;
  lat?: number;
  lon?: number;
  city?: string;
  suburb?: string;
  state?: string;
  country?: string;
  country_code?: string;
  categories?: string[];
}

/** Normalizes a Geoapify feature properties object into our internal Place shape. */
export function geoapifyPropsToPlace(p: GeoapifyProps): Record<string, unknown> {
  const address_components: unknown[] = [];
  if (p.suburb) address_components.push({ long_name: p.suburb, short_name: p.suburb, types: ['sublocality_level_1'] });
  if (p.city) address_components.push({ long_name: p.city, short_name: p.city, types: ['locality'] });
  if (p.state) address_components.push({ long_name: p.state, short_name: p.state, types: ['administrative_area_level_1'] });
  if (p.country) address_components.push({ long_name: p.country, short_name: p.country_code?.toUpperCase() ?? '', types: ['country'] });

  return {
    place_id: p.place_id,
    name: p.name || p.address_line1,
    formatted_address: p.formatted,
    geometry: p.lat != null && p.lon != null
      ? { location: { lat: p.lat, lng: p.lon } }
      : undefined,
    address_components,
    types: normalizeGeoapifyCategories(p.categories),
  };
}
