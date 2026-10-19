import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFavoriteListings } from "@/lib/queries";
import { HeartIcon } from "@/components/icons";
import { ListingGrid } from "@/components/listing-grid";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Favoris" };

export default async function FavoritesPage() {
  const user = await requireUser("/favoris");
  const listings = getFavoriteListings(user.id);

  return (
    <main className="px-4 md:px-6">
      <PageHeader
        title="Favoris"
        subtitle={listings.length ? `${listings.length} montre${listings.length > 1 ? "s" : ""} gardée${listings.length > 1 ? "s" : ""} de côté` : undefined}
        back="/"
      />
      {listings.length ? (
        <ListingGrid listings={listings} />
      ) : (
        <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-line-strong px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
            <HeartIcon size={26} />
          </span>
          <p className="mt-4 text-lg font-semibold">Aucun favori pour l&apos;instant</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Touchez le cœur sur une annonce pour la retrouver ici et suivre son prix.</p>
          <Link href="/annonces" className="mt-6 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-ink">
            Parcourir les annonces
          </Link>
        </div>
      )}
    </main>
  );
}
