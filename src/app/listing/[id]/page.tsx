export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import { CURRENCY } from '@/lib/config';
import ImageGallery from '@/components/ImageGallery';
import ContactButton from '@/components/ContactButton';
import StickyContactBar from '@/components/StickyContactBar';
import SoldBadge from '@/components/SoldBadge';
import PublicHeader from '@/components/PublicHeader';
import SizeGuideButton from '@/components/SizeGuideButton';
import RelatedListings from '@/components/RelatedListings';
import { SizeGuide } from '@/types';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: { id: string };
}

export default async function ListingDetailPage({ params }: Props) {
  const [{ data, error }, { data: settingsData }] = await Promise.all([
    supabase
      .from('listings')
      .select('*, listing_images(id, storage_path, display_order, created_at, listing_id)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'listing_message')
      .maybeSingle(),
  ]);

  if (error || !data) notFound();

  const listing = data as Listing;

  if (listing.is_hidden) notFound();

  // Fetch the size guide if the listing has one attached
  let sizeGuide: SizeGuide | null = null;
  if (listing.size_guide_id) {
    const { data: guideData } = await supabase
      .from('size_guides')
      .select('id, name, content, created_at')
      .eq('id', listing.size_guide_id)
      .single();
    sizeGuide = guideData ?? null;
  }

  const listingMessage: string = settingsData?.value ?? '';
  const currency = listing.currency || CURRENCY;
  const images = listing.listing_images ?? [];

  // Fetch related listings: same category first, then fill with others
  const RELATED_COUNT = 5;
  let relatedListings: Listing[] = [];

  if (listing.category) {
    const { data: sameCategory } = await supabase
      .from('listings')
      .select('*, listing_images(id, storage_path, display_order)')
      .eq('is_hidden', false)
      .eq('is_sold', false)
      .eq('category', listing.category)
      .neq('id', listing.id)
      .order('created_at', { ascending: false })
      .limit(RELATED_COUNT);

    relatedListings = sameCategory ?? [];
  }

  if (relatedListings.length < RELATED_COUNT) {
    const needed = RELATED_COUNT - relatedListings.length;
    const excludeIds = [listing.id, ...relatedListings.map((l) => l.id)];
    const { data: others } = await supabase
      .from('listings')
      .select('*, listing_images(id, storage_path, display_order)')
      .eq('is_hidden', false)
      .eq('is_sold', false)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(needed);

    relatedListings = [...relatedListings, ...(others ?? [])];
  }

  const conditionColors: Record<string, string> = {
    'Novo sa etiketom': 'bg-green-100 text-green-800',
    'Kao novo': 'bg-blue-100 text-blue-800',
    'Dobro': 'bg-yellow-100 text-yellow-800',
    'Korišćeno': 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      {/* Main — extra bottom padding on mobile for sticky bar */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-32 lg:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <div className="relative">
            <ImageGallery images={images} title={listing.title} />
            {listing.is_sold && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <SoldBadge />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">
                {listing.brand}
                {listing.category && (
                  <Link
                    href={`/?category=${encodeURIComponent(listing.category)}`}
                    className="ml-2 normal-case tracking-normal text-gray-300 hover:text-rose-400 transition-colors"
                  >
                    · {listing.category}
                  </Link>
                )}
                {listing.color && (
                  <span className="ml-2 normal-case tracking-normal text-gray-300">· {listing.color}</span>
                )}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {listing.title}
              </h1>
            </div>

            {/* Price — visible on desktop; on mobile it's in the sticky bar */}
            <div className="hidden md:flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {listing.price.toLocaleString('sr-RS')} {currency}
              </span>
            </div>

            {/* Price for mobile (inline, above badges) */}
            <div className="md:hidden">
              <span className="text-2xl font-bold text-gray-900">
                {listing.price.toLocaleString('sr-RS')} {currency}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {listing.size.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                    conditionColors[listing.condition] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {listing.condition}
                </span>
              </div>
            </div>

            {listing.is_sold && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 font-medium text-sm">Ovaj oglas je označen kao PRODATO.</p>
              </div>
            )}

            {listing.description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Opis
                </h2>
                <div
                  className="prose text-gray-700 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: listing.description }}
                />
              </div>
            )}

            {/* Contact — desktop only (mobile uses sticky bar) */}
            <div className="hidden md:block border-t border-gray-100 pt-5 space-y-4">
              {sizeGuide && (
                <SizeGuideButton name={sizeGuide.name} content={sizeGuide.content} />
              )}
              <ContactButton listingTitle={listing.title} />

              {listingMessage && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div
                    className="prose text-amber-900 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: listingMessage }}
                  />
                </div>
              )}
            </div>

            {/* Size guide button — mobile only */}
            {sizeGuide && (
              <div className="md:hidden">
                <SizeGuideButton name={sizeGuide.name} content={sizeGuide.content} />
              </div>
            )}

            {/* Message box — mobile only (shown above sticky bar area) */}
            {listingMessage && (
              <div className="md:hidden bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <div
                  className="prose text-amber-900 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: listingMessage }}
                />
              </div>
            )}
          </div>
        </div>

        <RelatedListings listings={relatedListings} category={listing.category} />

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Nazad na sve oglase
          </Link>
        </div>
      </main>

      {/* Mobile sticky contact bar */}
      <StickyContactBar
        listingTitle={listing.title}
        price={listing.price}
        currency={currency}
        isSold={listing.is_sold}
      />
    </div>
  );
}
