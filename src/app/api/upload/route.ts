import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';
import sharp from 'sharp';

// Accept any image type — sharp will normalize to JPEG
const ALLOWED_TYPES_PREFIX = 'image/';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB before conversion (HEIC can be large)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll('files') as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  if (files.length > 8) {
    return NextResponse.json({ error: 'Maximum 8 images allowed' }, { status: 400 });
  }

  const db = createServiceClient();
  const uploadedPaths: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith(ALLOWED_TYPES_PREFIX)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File ${file.name} exceeds 10MB limit` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Convert everything to JPEG — handles HEIC, HEIF, PNG, WEBP, etc.
    const jpegBuffer = await sharp(inputBuffer)
      .rotate() // auto-rotate based on EXIF orientation
      .jpeg({ quality: 88 })
      .toBuffer();

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const storagePath = `listings/${timestamp}-${random}.jpg`;

    const { error } = await db.storage
      .from('listing-images')
      .upload(storagePath, jpegBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    uploadedPaths.push(storagePath);
  }

  return NextResponse.json({ paths: uploadedPaths });
}
