export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import { Listing, Brand, Category, Color, SizeGuide, Size } from '@/types';
import ListingForm from '@/components/admin/ListingForm';

interface Props {
  params: { id: string };
}

export default async function EditListingPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const db = createServiceClient();
  const [
    { data, error },
    { data: brandsData },
    { data: categoriesData },
    { data: colorsData },
    { data: sizeGuidesData },
    { data: sizesData },
  ] = await Promise.all([
    db.from('listings')
      .select('*, listing_images(id, storage_path, display_order, created_at, listing_id)')
      .eq('id', params.id)
      .single(),
    db.from('brands').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('categories').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('colors').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('size_guides').select('id, name, content, created_at').order('created_at', { ascending: true }),
    db.from('sizes').select('id, name, display_order, created_at').order('display_order').order('name'),
  ]);

  if (error || !data) notFound();

  const listing = data as Listing;
  const brands: Brand[] = brandsData ?? [];
  const categories: Category[] = categoriesData ?? [];
  const colors: Color[] = colorsData ?? [];
  const sizeGuides: SizeGuide[] = sizeGuidesData ?? [];
  const sizes: string[] = ((sizesData ?? []) as Size[]).map((s) => s.name);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Nazad na dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Uredi oglas</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {listing.title}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <ListingForm listing={listing} brands={brands} categories={categories} colors={colors} sizeGuides={sizeGuides} sizes={sizes} />
      </div>
    </div>
  );
}
