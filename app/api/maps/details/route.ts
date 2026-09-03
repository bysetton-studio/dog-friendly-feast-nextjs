import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedDetails, setCachedDetails } from '@/lib/mapsServerCache';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.GEOAPIFY_API_KEY ?? '';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const placeId: unknown = body.placeId;
  if (!placeId || typeof placeId !== 'string') {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 });
  }

  const cached = await getCachedDetails(placeId);
  if (cached) return NextResponse.json(cached);

  if (!(await canMakeMapsRequest('places_details'))) {
    return NextResponse.json({ error: 'cap_reached' }, { status: 429 });
  }

  const url = `https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(placeId)}&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify place details HTTP error', res.status, await res.text());
    return NextResponse.json({ error: 'upstream_error' }, { status: res.status });
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const place = geoapifyPropsToPlace(feature.properties);
  await setCachedDetails(placeId, place);
  return NextResponse.json(place);
}
