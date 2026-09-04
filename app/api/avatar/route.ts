import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const USE_BLOB = Boolean(
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN !== 'your_token_here'
);

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    let imageUrl: string;

    if (USE_BLOB) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`avatars/${session.user.id}.jpg`, file, {
        access: 'public',
        contentType: 'image/jpeg',
      });
      imageUrl = blob.url;
    } else {
      // Local dev: store as base64 data URL directly in the DB
      const buffer = Buffer.from(await file.arrayBuffer());
      imageUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
