import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPredictions, setCachedPredictions, setCachedDetails } from '@/lib/mapsServerCache';
import { geoapifyPropsToPlace } from '@/lib/placeUtils';

const API_KEY = process.env.GEOAPIFY_API_SECRET ?? '';

export async function POST(req: NextRequest) {

  console.log(API_KEY, '----------------------- API_KEY');
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
  const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&filter=countrycode:za&limit=5&format=json&apiKey=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    console.error('[Maps] Geoapify autocomplete HTTP error', res.status, await res.text());
    return NextResponse.json({ predictions: [] }, { status: res.status });
  }

  const data = await res.json();
  const results: Record<string, unknown>[] = data.results ?? [];

  const predictions = results
    .filter((f) => f.place_id)
    .map((f) => {
      const place = geoapifyPropsToPlace(f);

      // Cache full place data by place_id so the details endpoint can return it without a second API call
      if (f.place_id) {
        setCachedDetails(f.place_id as string, place);
      }

      return {
        place_id: f.place_id as string,
        description: (f.formatted as string) ?? '',
        structured_formatting: {
          main_text: ((f.name || f.address_line1) as string) ?? '',
          secondary_text: ((f.address_line2 || f.city || '') as string),
        },
        category: (f.categories as string[]) ?? [],
      };
    });

  await setCachedPredictions(cacheKey, predictions);
  return NextResponse.json({ predictions });
}
