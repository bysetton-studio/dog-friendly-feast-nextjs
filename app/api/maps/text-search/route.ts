import { NextRequest, NextResponse } from 'next/server';
import { resolvePlaceDetails } from '@/lib/resolvePlaceDetails';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { placeId } = body as { placeId?: string };
  if (!placeId) {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 });
  }

  const place = await resolvePlaceDetails(placeId);
  if (!place) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(place);
}
