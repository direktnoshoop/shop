import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import sharp from "sharp";

// Accept any image type — sharp will normalize to JPEG
const ALLOWED_TYPES_PREFIX = "image/";
const MAX_FILE_SIZE = 80 * 1024 * 1024; // 60MB before conversion (iPhone Pro RAW/HEIC)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 8) {
      return NextResponse.json(
        { error: "Maximum 8 images allowed" },
        { status: 400 },
      );
    }

    const db = createServiceClient();
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const fileType = file.type || '';
      if (fileType && !fileType.startsWith(ALLOWED_TYPES_PREFIX)) {
        return NextResponse.json(
          { error: `Invalid file type: ${fileType}` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large (max 80MB before processing)` },
          { status: 400 },
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      let jpegBuffer: Buffer;
      try {
        jpegBuffer = await sharp(inputBuffer)
          .rotate()
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (sharpErr) {
        const msg = sharpErr instanceof Error ? sharpErr.message : String(sharpErr);
        return NextResponse.json(
          { error: `Image processing failed: ${msg}` },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const storagePath = `listings/${timestamp}-${random}.jpg`;

      const { error } = await db.storage
        .from("listing-images")
        .upload(storagePath, jpegBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 });
      }

      uploadedPaths.push(storagePath);
    }

    return NextResponse.json({ paths: uploadedPaths });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[upload] Unhandled error:', msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
