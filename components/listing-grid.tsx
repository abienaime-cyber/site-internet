import type { ListingCardData } from "@/lib/queries";
import { ListingCard } from "./listing-card";

export function ListingGrid({ listings, wide = false }: { listings: ListingCardData[]; wide?: boolean }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 ${wide ? "xl:grid-cols-3" : "lg:grid-cols-4"}`}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
