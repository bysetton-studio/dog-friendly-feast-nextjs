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
 * Maps Geoapify category strings to the simplified type keys used by TYPE_FILTERS.
 * Uses startsWith so subcategories (e.g. catering.restaurant.italian) are caught by their parent.
 */
export function normalizeGeoapifyCategories(categories: string[] | undefined): string[] {
  if (!categories) return [];
  const mapped: string[] = [];
  for (const cat of categories) {
    if (cat.startsWith('catering.restaurant') || cat.startsWith('catering.fast_food') || cat === 'catering.food_court') {
      mapped.push('restaurant');
    } else if (cat.startsWith('catering.cafe') || cat === 'catering.ice_cream') {
      mapped.push('cafe');
    } else if (cat === 'catering.bar' || cat === 'catering.pub' || cat === 'catering.biergarten' || cat === 'catering.taproom') {
      mapped.push('bar');
    } else if (cat === 'commercial.shopping_mall' || cat === 'commercial.department_store' || cat === 'commercial.marketplace') {
      mapped.push('shopping_mall');
    } else if (cat === 'commercial.supermarket') {
      mapped.push('supermarket');
    } else if (cat === 'commercial.convenience') {
      mapped.push('convenience_store');
    } else if (cat.startsWith('leisure.park') || cat.startsWith('natural.')) {
      mapped.push('park');
    }
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
  result_type?: string;
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
    result_type: p.result_type,
  };
}
