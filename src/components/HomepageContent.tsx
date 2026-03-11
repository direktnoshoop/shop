'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Listing } from '@/types';
import { toRSD } from '@/lib/config';
import FilterBar from './FilterBar';
import ListingGrid from './ListingGrid';

interface Props {
  listings: Listing[];
  brands: string[];
  categories: string[];
  colors: string[];
  sizes: string[];
  maxPrice: number;
}

export default function HomepageContent({ listings, brands, categories, colors, sizes, maxPrice }: Props) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const selectedBrands = (searchParams.get('brand') ?? '').split(',').filter(Boolean);
    const selectedSizes = (searchParams.get('size') ?? '').split(',').filter(Boolean);
    const selectedCategories = (searchParams.get('category') ?? '').split(',').filter(Boolean);
    const selectedColors = (searchParams.get('color') ?? '').split(',').filter(Boolean);
    const minPrice = parseInt(searchParams.get('minPrice') ?? '0');
    const maxPriceFilter = parseInt(searchParams.get('maxPrice') ?? String(maxPrice));

    return listings.filter((listing) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(listing.brand)) return false;
      if (selectedSizes.length > 0 && !listing.size.some((s) => selectedSizes.includes(s))) return false;
      if (selectedCategories.length > 0) {
        if (!listing.category || !selectedCategories.includes(listing.category)) return false;
      }
      if (selectedColors.length > 0) {
        if (!listing.color || !selectedColors.includes(listing.color)) return false;
      }
      const priceInRSD = toRSD(listing.price, listing.currency);
      if (priceInRSD < minPrice) return false;
      if (priceInRSD > maxPriceFilter) return false;
      return true;
    });
  }, [listings, searchParams, maxPrice]);

  return (
    <div className="flex gap-6 items-start">
      <FilterBar brands={brands} categories={categories} colors={colors} sizes={sizes} maxListingPrice={maxPrice} />
      <div className="flex-1 min-w-0 pb-24 lg:pb-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filtered.length} {filtered.length === 1 ? 'oglas' : 'oglasa'}
          </p>
        </div>
        <ListingGrid listings={filtered} />
      </div>
    </div>
  );
}
