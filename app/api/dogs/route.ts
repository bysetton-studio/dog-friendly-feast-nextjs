import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_DOGS = 5;

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const count = await prisma.userDog.count({ where: { userId: session.user.id } });
  if (count >= MAX_DOGS) {
    return NextResponse.json({ error: 'Maximum of 5 dogs reached' }, { status: 400 });
  }

  const dog = await prisma.userDog.create({
    data: { userId: session.user.id },
  });

  return NextResponse.json(dog);
}
