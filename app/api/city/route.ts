import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log( req.headers, ' req.headers')
  const country = req.headers.get('x-vercel-ip-country');
  const city = req.headers.get('x-vercel-ip-city');
  console.log(city, 'city')
  console.log(country, 'country')
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
