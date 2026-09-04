import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const IS_LOCAL = process.env.NODE_ENV === 'development';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const dog = await prisma.userDog.findUnique({ where: { id } });

  if (!dog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (dog.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  try {
    let imageUrl: string;

    if (!IS_LOCAL) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`dog-avatars/${id}.jpg`, file, {
        allowOverwrite: true,
        access: 'public',
        contentType: 'image/jpeg',
      });
      imageUrl = blob.url;
    } else {
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    await prisma.userDog.update({ where: { id }, data: { image: imageUrl } });
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
