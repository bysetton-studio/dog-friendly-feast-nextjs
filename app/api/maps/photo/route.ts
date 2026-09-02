import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPhotoUrl, setCachedPhotoUrl } from '@/lib/mapsServerCache';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

// Proxies a Google Places photo so the API key never reaches the browser.
// Usage: GET /api/maps/photo?name=places/.../photos/...&maxWidth=280
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get('name');
  const maxWidth = searchParams.get('maxWidth') ?? '280';

  if (!name) {
    return new NextResponse('missing name', { status: 400 });
  }

  const cached = await getCachedPhotoUrl(name);
  if (cached) {
    return NextResponse.redirect(cached, { status: 302 });
  }

  if (!(await canMakeMapsRequest('place_photo'))) {
    return new NextResponse('photo unavailable', { status: 429 });
  }

  const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}&key=${API_KEY}&skipHttpRedirect=true`;
  const res = await fetch(url);

  if (!res.ok) {
    return new NextResponse('photo unavailable', { status: res.status });
  }

  const data = await res.json();
  const photoUri: string = data.photoUri;
  if (!photoUri) {
    return new NextResponse('photo unavailable', { status: 404 });
  }

  await setCachedPhotoUrl(name, photoUri);

  return NextResponse.redirect(photoUri, { status: 302 });
}
