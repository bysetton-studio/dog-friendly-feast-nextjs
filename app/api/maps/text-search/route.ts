import { NextRequest, NextResponse } from 'next/server';
import { resolvePlaceDetails } from '@/lib/resolvePlaceDetails';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, address } = body as { name?: string; address?: string };
  if (!name || !address) {
    return NextResponse.json({ error: 'name and address required' }, { status: 400 });
  }

  const place = await resolvePlaceDetails(name, address);
  if (!place) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(place);
}
