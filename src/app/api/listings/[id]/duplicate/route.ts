import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase';

// POST /api/listings/[id]/duplicate — admin only
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Fetch original listing with images
  const { data: original, error: fetchError } = await db
    .from('listings')
    .select('*, listing_images(id, storage_path, display_order)')
    .eq('id', params.id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  // Create duplicate listing
  const { data: newListing, error: insertError } = await db
    .from('listings')
    .insert({
      title: `Kopija: ${original.title}`,
      brand: original.brand,
      size: original.size,
      price: original.price,
      currency: original.currency,
      condition: original.condition,
      description: original.description,
      category: original.category,
      color: original.color,
      stock: original.stock,
      is_sold: false,
      is_hidden: true,
    })
    .select()
    .single();

  if (insertError || !newListing) {
    return NextResponse.json({ error: insertError?.message ?? 'Failed to duplicate' }, { status: 500 });
  }

  // Copy images (same storage paths, new rows)
  const images = original.listing_images ?? [];
  if (images.length > 0) {
    const imageRows = images.map((img: { storage_path: string; display_order: number }) => ({
      listing_id: newListing.id,
      storage_path: img.storage_path,
      display_order: img.display_order,
    }));
    await db.from('listing_images').insert(imageRows);
  }

  return NextResponse.json({ id: newListing.id }, { status: 201 });
}
