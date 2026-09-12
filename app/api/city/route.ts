import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const city = req.headers.get('x-vercel-ip-city');
  const latStr = req.headers.get('x-vercel-ip-latitude');
  const lngStr = req.headers.get('x-vercel-ip-longitude');

  const lat = latStr ? parseFloat(latStr) : null;
  const lng = lngStr ? parseFloat(lngStr) : null;

  return NextResponse.json({
    city: city ? decodeURIComponent(city) : null,
    lat: lat !== null && !isNaN(lat) ? lat : null,
    lng: lng !== null && !isNaN(lng) ? lng : null,
  });
}
