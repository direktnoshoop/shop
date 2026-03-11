import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { createServiceClient, supabase } from '@/lib/supabase';

// GET /api/listings — public, returns non-hidden listings with their images
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const brand = searchParams.get('brand');
  const size = searchParams.get('size');
  const category = searchParams.get('category');
  const color = searchParams.get('color');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const includeSold = searchParams.get('includeSold') === 'true';
  const includeHidden = searchParams.get('includeHidden') === 'true';

  let query = supabase
    .from('listings')
    .select('*, listing_images(id, storage_path, display_order)')
    .order('created_at', { ascending: false });

  if (!includeHidden) query = query.eq('is_hidden', false);
  if (!includeSold) {
    // still include sold items for public display (with badge), just not hidden ones
  }

  if (brand) {
    const brands = brand.split(',');
    query = query.in('brand', brands);
  }
  if (size) {
    const sizes = size.split(',');
    query = query.overlaps('size', sizes);
  }
  if (category) {
    const categories = category.split(',');
    query = query.in('category', categories);
  }
  if (color) {
    const colors = color.split(',');
    query = query.in('color', colors);
  }
  if (minPrice) query = query.gte('price', parseFloat(minPrice));
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/listings — admin only
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, brand, size, price, currency, condition, description, category, color, image_paths, new_image_orders } = body;

  if (!title || !brand || !size || !price || !condition) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: listing, error: listingError } = await db
    .from('listings')
    .insert({
      title,
      brand,
      size,
      price: parseFloat(price),
      currency: currency ?? 'RSD',
      condition,
      description: description ?? null,
      category: category ?? null,
      color: color ?? null,
    })
    .select()
    .single();

  if (listingError) {
    return NextResponse.json({ error: listingError.message }, { status: 500 });
  }

  if (image_paths && image_paths.length > 0) {
    const imageRows = image_paths.map((path: string, idx: number) => ({
      listing_id: listing.id,
      storage_path: path,
      display_order: new_image_orders ? new_image_orders[idx] : idx,
    }));

    const { error: imgError } = await db.from('listing_images').insert(imageRows);
    if (imgError) {
      return NextResponse.json({ error: imgError.message }, { status: 500 });
    }
  }

  revalidatePath('/');
  return NextResponse.json(listing, { status: 201 });
}
