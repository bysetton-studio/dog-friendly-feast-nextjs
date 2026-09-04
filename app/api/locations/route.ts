import { isMapsCapReached } from '@/lib/mapsRateLimit';
import { getCity, getSuburb } from '@/lib/placeUtils';
import { prisma } from '@/lib/prisma';
import { PlaceData, resolvePlaceDetails } from '@/lib/resolvePlaceDetails';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const [locations, capReached] = await Promise.all([
    prisma.location.findMany({
      orderBy: { createdAt: 'desc' },
      include: { resolved: true },
    }),
    isMapsCapReached(),
  ]);

  const resolved = await Promise.all(
    locations.map(async (l) => {
      let place: PlaceData | null = null;

      if (l.resolved) {
        place = l.resolved.placeData as PlaceData;
      } else {
        place = await resolvePlaceDetails(l.name, l.address);
        if (place) {
          const types = (place.types as string[] | undefined) ?? [];
          await Promise.all([
            prisma.location.update({
              where: { id: l.id },
              data: { 
                types, 
                resolved: { 
                  upsert: {
                    update: { placeData: place as object },
                    create: { placeData: place as object },
                  } 
                } 
              },
            }),
          ]);
        }
      }

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
  const { name, address, isFriendly: friendly, types: userTypes } = body as {
    name: string;
    address: string;
    isFriendly: boolean;
    types?: string[];
  };

  if (!name || !address || typeof friendly !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: req.headers });

  const location = await prisma.location.create({
    data: {
      name,
      address,
      isFriendly: friendly,
      isAdminApproved: false,
      updatedAt: new Date(),
      ...(userTypes ? { types: userTypes } : {}),
      ...(session ? { suggestedById: session.user.id } : {}),
    },
  });

  const place = await resolvePlaceDetails(name, address);
  if (place) {
    const types = (place.types as string[] | undefined) ?? [];
    await Promise.all([
      prisma.location.update({
        where: { id: location.id },
        data: { 
          types, 
          resolved: { 
            create: { 
              placeData: place as object 
            } 
          } 
        },
      }),
    ]);

    const addressComponents = place.address_components as
      | { long_name: string; types: string[] }[]
      | undefined;

    return NextResponse.json({
      ...location,
      place,
      city: getCity(addressComponents),
      suburb: getSuburb(addressComponents),
    }, { status: 201 });
  }

  return NextResponse.json(location, { status: 201 });
}
