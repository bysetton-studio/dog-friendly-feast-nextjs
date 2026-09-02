import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedDetails, setCachedDetails } from '@/lib/mapsServerCache';

const API_KEY = process.env.GOOGLE_MAPS_API_SECRET;

const FIELD_MASK = 'id,location,displayName,formattedAddress,addressComponents,types';

interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const placeId: unknown = body.placeId;
  if (!placeId || typeof placeId !== 'string') {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 });
  }

  const cached = await getCachedDetails(placeId);
  if (cached) {
    return NextResponse.json(cached);
  }

  if (!(await canMakeMapsRequest('places_details'))) {
    return NextResponse.json({ error: 'cap_reached' }, { status: 429 });
  }

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': FIELD_MASK },
  });

  if (!res.ok) {
    console.error('[Maps] Place Details HTTP error', res.status, await res.text());
    return NextResponse.json({ error: 'upstream_error' }, { status: res.status });
  }

  const p = await res.json();

  const place = {
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
  };

  await setCachedDetails(placeId, place);
  return NextResponse.json(place);
}
