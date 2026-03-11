import { Listing } from '@/types';
import ListingCard from './ListingCard';

interface Props {
  listings: Listing[];
}

export default function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">Nema oglasa</p>
        <p className="text-sm mt-1">Pokušajte sa drugačijim filterima.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
