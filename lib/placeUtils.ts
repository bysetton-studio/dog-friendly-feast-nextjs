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
