import { NextRequest, NextResponse } from 'next/server';
import { canMakeMapsRequest } from '@/lib/mapsRateLimit';
import { getCachedPredictions, setCachedPredictions } from '@/lib/mapsServerCache';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

interface PlacePrediction {
  placeId: string;
  text: { text: string };
  structuredFormat?: {
    mainText?: { text: string };
    secondaryText?: { text: string };
  };
}

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

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
    body: JSON.stringify({ input, includedRegionCodes: ['za'] }),
  });

  if (!res.ok) {
    console.error('[Maps] Autocomplete HTTP error', res.status, await res.text());
    return NextResponse.json({ predictions: [] }, { status: res.status });
  }

  const data = await res.json();

  const predictions = ((data.suggestions ?? []) as { placePrediction?: PlacePrediction }[])
    .flatMap((s) => (s.placePrediction ? [s.placePrediction] : []))
    .map((p) => ({
      place_id: p.placeId,
      description: p.text.text,
      structured_formatting: {
        main_text: p.structuredFormat?.mainText?.text ?? '',
        secondary_text: p.structuredFormat?.secondaryText?.text ?? '',
      },
    }));

  await setCachedPredictions(cacheKey, predictions);
  return NextResponse.json({ predictions });
}
