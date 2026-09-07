import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.GEOAPIFY_API_SECRET ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng))) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  if (!(await canMakeMapsRequest('reverse_geocode'))) {
    return NextResponse.json({ error: 'cap_reached' }, { status: 429 });
  }

  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify reverse geocode HTTP error', res.status, await res.text());
    return NextResponse.json({ error: 'upstream_error' }, { status: res.status });
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const place = geoapifyPropsToPlace(feature.properties);
  return NextResponse.json(place);
}
