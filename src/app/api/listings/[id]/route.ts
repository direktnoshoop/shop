import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { createServiceClient, supabase } from '@/lib/supabase';

// GET /api/listings/[id] — public
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(id, storage_path, display_order)')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/listings/[id] — admin only
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = createServiceClient();

  // Separate image-related fields from listing fields
  const {
    image_paths,
    new_image_orders,
    deleted_image_ids,
    existing_image_orders,
    ...listingFields
  } = body;

  const updateData: Record<string, unknown> = {
    ...listingFields,
    updated_at: new Date().toISOString(),
  };

  if (listingFields.price !== undefined) {
    updateData.price = parseFloat(listingFields.price);
  }

  const { data, error } = await db
    .from('listings')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Delete removed images
  if (deleted_image_ids && deleted_image_ids.length > 0) {
    await db.from('listing_images').delete().in('id', deleted_image_ids);
  }

  // Update display_order for existing images that were reordered
  if (existing_image_orders && existing_image_orders.length > 0) {
    for (const { id, display_order } of existing_image_orders as { id: string; display_order: number }[]) {
      await db.from('listing_images').update({ display_order }).eq('id', id);
    }
  }

  // Insert new images with their assigned display_order positions
  if (image_paths && image_paths.length > 0) {
    const imageRows = image_paths.map((path: string, idx: number) => ({
      listing_id: params.id,
      storage_path: path,
      // new_image_orders[idx] is the position in the final unified list
      display_order: new_image_orders ? new_image_orders[idx] : idx,
    }));

    await db.from('listing_images').insert(imageRows);
  }

  revalidatePath('/');
  revalidatePath(`/listing/${params.id}`);
  return NextResponse.json(data);
}

// DELETE /api/listings/[id] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  // Fetch images to delete from storage
  const { data: images } = await db
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', params.id);

  if (images && images.length > 0) {
    const paths = images.map((img: { storage_path: string }) => img.storage_path);
    await db.storage.from('listing-images').remove(paths);
  }

  const { error } = await db.from('listings').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath(`/listing/${params.id}`);
  return NextResponse.json({ success: true });
}
