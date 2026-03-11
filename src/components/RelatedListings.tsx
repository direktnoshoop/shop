import { Listing } from "@/types";
import ListingCard from "./ListingCard";

interface Props {
  listings: Listing[];
  category?: string;
}

export default function RelatedListings({ listings, category }: Props) {
  if (listings.length === 0) return null;

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        {"Pogledaj još"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
