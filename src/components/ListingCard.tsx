import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';
import { getPublicImageUrl } from '@/lib/supabase';
import SoldBadge from './SoldBadge';
import { CURRENCY } from '@/lib/config';

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const firstImage = listing.listing_images
    ?.sort((a, b) => a.display_order - b.display_order)[0];
  const imageUrl = firstImage ? getPublicImageUrl(firstImage.storage_path) : null;
  const currency = listing.currency || CURRENCY;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm active:shadow-md transition-shadow duration-200"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {listing.is_sold && <SoldBadge />}
        {/* Category badge overlaid on image */}
        {listing.category && !listing.is_sold && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
            {listing.category}
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 truncate">
          {listing.brand}
        </p>
        <h3 className="text-sm font-medium text-gray-900 truncate leading-snug">
          {listing.title}
        </h3>
        <div className="mt-2">
          <span className="text-base font-bold text-gray-900">
            {listing.price.toLocaleString('sr-RS')} {currency}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">{listing.condition}</p>
      </div>
    </Link>
  );
}
