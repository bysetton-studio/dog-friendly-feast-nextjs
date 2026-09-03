import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPredictions, setCachedPredictions, setCachedDetails } from '@/lib/mapsServerCache';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const input: unknown = body.input;
  if (!input || typeof input !== 'string') {
    return NextResponse.json({ predictions: [] });
  }

  const cacheKey = input.trim().toLowerCase();
  const cached = await getCachedPredictions(cacheKey);
  if (cached) {
    return NextResponse.json({ predictions: cached });
  }

  if (!(await canMakeMapsRequest('autocomplete'))) {
    return NextResponse.json({ predictions: [] }, { status: 429 });
  }

  const query = encodeURIComponent(input);
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&filter=countrycode:za&limit=5&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify autocomplete HTTP error', res.status, await res.text());
    return NextResponse.json({ predictions: [] }, { status: res.status });
  }

  const data = await res.json();
  const features: { properties: Record<string, unknown> }[] = data.features ?? [];

  const predictions = features
    .filter((f) => f.properties.place_id)
    .map((f) => {
      const p = f.properties;
      const place = geoapifyPropsToPlace(p);

      // Cache full place data by place_id so the details endpoint can return it without a second API call
      if (p.place_id) {
        setCachedDetails(p.place_id as string, place);
      }

      return {
        place_id: p.place_id as string,
        description: (p.formatted as string) ?? '',
        structured_formatting: {
          main_text: ((p.name || p.address_line1) as string) ?? '',
          secondary_text: ((p.address_line2 || p.city || '') as string),
        },
      };
    });

  await setCachedPredictions(cacheKey, predictions);
  return NextResponse.json({ predictions });
}
