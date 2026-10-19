import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ListingCardData } from "@/lib/queries";
import { FavoriteButton } from "./favorite-button";
import { RatingBadge } from "./rating";
import { WatchMedia } from "./watch-media";

export function ListingCard({ listing, showFavorite = true }: { listing: ListingCardData; showFavorite?: boolean }) {
  const title = `${listing.brand} ${listing.model}`;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition hover:border-line-strong">
      <Link href={`/annonces/${listing.id}`} className="flex flex-1 flex-col">
      <div className="stage relative aspect-[4/4.4] overflow-hidden">
        <WatchMedia
          photoId={listing.photo_id}
          visual={listing.visual}
          alt={title}
          className="transition duration-500 group-hover:scale-[1.04]"
        />
        {listing.status !== "active" && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text">
            {listing.status === "sold" ? "Vendue" : "Réservée"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-2.5">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{listing.brand}</p>
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug">{listing.model}</h3>
        <p className="truncate text-xs text-faint">
          {listing.reference || "Sans référence"}
          {listing.year ? ` · ${listing.year}` : ""}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-base font-bold tracking-tight">{formatPrice(listing.price)}</span>
          <RatingBadge value={listing.seller_rating} count={listing.seller_reviews} />
        </div>
      </div>
      </Link>
      {showFavorite && (
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton listingId={listing.id} initial={Boolean(listing.is_favorite)} />
        </div>
      )}
    </div>
  );
}
