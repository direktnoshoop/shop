import { Suspense } from "react";

export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/types";
import { toRSD } from "@/lib/config";
import HomepageContent from "@/components/HomepageContent";
import PublicHeader from "@/components/PublicHeader";

export default async function HomePage() {
  const [listingsResult, brandsResult, categoriesResult, colorsResult, sizesResult] =
    await Promise.all([
      supabase
        .from("listings")
        .select("*, listing_images(id, storage_path, display_order)")
        .eq("is_hidden", false)
        .eq("is_sold", false)
        .order("created_at", { ascending: false }),
      supabase.from("brands").select("name").order("name", { ascending: true }),
      supabase
        .from("categories")
        .select("name")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("colors")
        .select("name")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("sizes")
        .select("name")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

  const allListings: Listing[] = listingsResult.data ?? [];
  const brands: string[] = (brandsResult.data ?? []).map(
    (b: { name: string }) => b.name,
  );
  const categories: string[] = (categoriesResult.data ?? []).map(
    (c: { name: string }) => c.name,
  );
  const colors: string[] = (colorsResult.data ?? []).map(
    (c: { name: string }) => c.name,
  );
  const sizes: string[] = (sizesResult.data ?? []).map(
    (s: { name: string }) => s.name,
  );

  const maxPrice =
    allListings.length > 0
      ? Math.ceil(
          Math.max(...allListings.map((l) => toRSD(l.price, l.currency))) /
            1000,
        ) * 1000
      : 50000;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={<HomepageSkeleton />}>
          <HomepageContent
            listings={allListings}
            brands={brands}
            categories={categories}
            colors={colors}
            sizes={sizes}
            maxPrice={maxPrice}
          />
        </Suspense>
      </main>
    </div>
  );
}

function HomepageSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-96 animate-pulse" />
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden animate-pulse"
          >
            <div className="aspect-[3/4] bg-gray-200" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
