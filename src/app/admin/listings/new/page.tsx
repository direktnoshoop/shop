import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import { Brand, Category, Color, SizeGuide, Size } from '@/types';
import ListingForm from '@/components/admin/ListingForm';

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const db = createServiceClient();
  const [{ data: brandsData }, { data: categoriesData }, { data: colorsData }, { data: sizeGuidesData }, { data: sizesData }] = await Promise.all([
    db.from('brands').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('categories').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('colors').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('size_guides').select('id, name, content, created_at').order('created_at', { ascending: true }),
    db.from('sizes').select('id, name, display_order, created_at').order('display_order').order('name'),
  ]);

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
        <h1 className="text-2xl font-bold text-gray-900">Novi oglas</h1>
        <p className="text-sm text-gray-500 mt-1">Popuni formu da objaviš novi artikal.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <ListingForm brands={brands} categories={categories} colors={colors} sizeGuides={sizeGuides} sizes={sizes} />
      </div>
    </div>
  );
}
