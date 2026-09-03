import { NextRequest, NextResponse } from 'next/server';
import { getCachedDetails } from '@/lib/mapsServerCache';

/**
 * Returns place details for a given place_id.
 * The place data is pre-populated into cache during the autocomplete call,
 * so no additional Geoapify API request is needed.
 */
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

  // Place not in cache — user has a place_id we have not seen via autocomplete in this session.
  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}
