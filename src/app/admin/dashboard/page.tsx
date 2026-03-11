export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import { Listing } from '@/types';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const db = createServiceClient();
  const { data } = await db
    .from('listings')
    .select('*, listing_images(id, storage_path, display_order)')
    .order('created_at', { ascending: false });

  const listings: Listing[] = data ?? [];
  const activeCount = listings.filter((l) => !l.is_sold && !l.is_hidden).length;
  const soldCount = listings.filter((l) => l.is_sold).length;
  const hiddenCount = listings.filter((l) => l.is_hidden && !l.is_sold).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upravljanje oglasima</h1>
          <p className="text-sm text-gray-500 mt-1">
            {listings.length} ukupno · {activeCount} aktivnih · {soldCount} prodatih · {hiddenCount} skrivenih
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novi oglas
        </Link>
      </div>

      <AdminDashboardClient listings={listings} />
    </div>
  );
}
