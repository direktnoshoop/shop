export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase';
import { Brand, Category, Color, SizeGuide, Size } from '@/types';
import SettingsClient from '@/components/admin/SettingsClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const db = createServiceClient();

  const [{ data: brandsData }, { data: categoriesData }, { data: colorsData }, { data: sizeGuidesData }, { data: sizesData }, { data: settingsData }] = await Promise.all([
    db.from('brands').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('categories').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('colors').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('size_guides').select('id, name, content, created_at').order('created_at', { ascending: true }),
    db.from('sizes').select('id, name, display_order, created_at').order('display_order').order('name'),
    db.from('site_settings').select('key, value'),
  ]);

  const brands: Brand[] = brandsData ?? [];
  const categories: Category[] = categoriesData ?? [];
  const colors: Color[] = colorsData ?? [];
  const sizeGuides: SizeGuide[] = sizeGuidesData ?? [];
  const sizes: Size[] = sizesData ?? [];
  const settingsMap: Record<string, string> = {};
  for (const row of settingsData ?? []) settingsMap[row.key] = row.value;
  const listingMessage: string = settingsMap['listing_message'] ?? '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Podešavanja</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upravljaj markama, kategorijama, bojama, vodičima za veličine i porukom na oglasima.
        </p>
      </div>

      <SettingsClient
        initialBrands={brands}
        initialCategories={categories}
        initialColors={colors}
        initialSizes={sizes}
        initialSizeGuides={sizeGuides}
        initialListingMessage={listingMessage}
      />
    </div>
  );
}
