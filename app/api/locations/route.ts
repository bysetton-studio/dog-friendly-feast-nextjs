import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolvePlaceDetails } from '@/lib/resolvePlaceDetails';
import { getCity, getSuburb } from '@/lib/placeUtils';
import { isMapsCapReached } from '@/lib/mapsRateLimit';

export async function GET() {
  const [locations, capReached] = await Promise.all([
    prisma.location.findMany({ orderBy: { createdAt: 'desc' } }),
    isMapsCapReached(),
  ]);

  const resolved = await Promise.all(
    locations.map(async (l) => {
      const place = await resolvePlaceDetails(l.name, l.address);
      if (!place) return null;

      const addressComponents = place.address_components as
        | { long_name: string; types: string[] }[]
        | undefined;

      return {
        name: l.name,
        address: l.address,
        isFriendly: l.isFriendly,
        isApproved: l.isAdminApproved,
        place,
        city: getCity(addressComponents),
        suburb: getSuburb(addressComponents),
      };
    })
  );

  return NextResponse.json({ resolved: resolved.filter(Boolean), capReached });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, address, isFriendly: friendly } = body as {
    name: string;
    address: string;
    isFriendly: boolean;
  };

  if (!name || !address || typeof friendly !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: { name, address, isFriendly: friendly, isAdminApproved: false, updatedAt: new Date() },
  });

  return NextResponse.json(location, { status: 201 });
}
