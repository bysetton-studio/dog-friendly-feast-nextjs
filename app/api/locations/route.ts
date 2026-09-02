import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolvePlaceDetails } from '@/lib/resolvePlaceDetails';
import { isFriendly, isApproved, getCity, getSuburb } from '@/lib/placeUtils';

export async function GET() {
  const locations = await prisma.location.findMany({
    orderBy: { createdAt: 'desc' },
  });

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

  return NextResponse.json(resolved.filter(Boolean));
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
