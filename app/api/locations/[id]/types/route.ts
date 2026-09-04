import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { types } = await req.json();

  if (!Array.isArray(types)) {
    return NextResponse.json({ error: 'Invalid types' }, { status: 400 });
  }

  // Only allow the submitter to edit their own pending locations
  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (location.suggestedById !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (location.isAdminApproved) {
    return NextResponse.json({ error: 'Cannot edit approved location' }, { status: 403 });
  }

  const updated = await prisma.location.update({
    where: { id },
    data: { types },
  });

  return NextResponse.json({ types: updated.types });
}
