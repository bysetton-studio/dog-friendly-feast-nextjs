import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const locations = await prisma.location.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    locations.map((l) => ({
      name: l.name,
      address: l.address,
      friendly: l.isFriendly,
      adminApproved: l.isAdminApproved,
    }))
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, address, isFriendly } = body as {
    name: string;
    address: string;
    isFriendly: boolean;
  };

  if (!name || !address || typeof isFriendly !== 'boolean') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const location = await prisma.location.create({
    data: { name, address, isFriendly, isAdminApproved: false },
  });

  return NextResponse.json(location, { status: 201 });
}
