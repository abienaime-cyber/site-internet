import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatMemberSince } from "@/lib/format";
import { getSeller, getSellerListings, getSellerReviews } from "@/lib/queries";
import { Avatar } from "@/components/avatar";
import { CalendarIcon, PinIcon } from "@/components/icons";
import { ListingGrid } from "@/components/listing-grid";
import { PageHeader } from "@/components/page-header";
import { Stars } from "@/components/rating";
import { ReviewList } from "@/components/review-list";

export async function generateMetadata({ params }: PageProps<"/vendeurs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const seller = getSeller(Number(id));
  return { title: seller ? seller.name : "Vendeur introuvable" };
}

export default async function SellerPage({ params }: PageProps<"/vendeurs/[id]">) {
  const { id } = await params;
  const seller = getSeller(Number(id));
  if (!seller) notFound();
  const viewer = await getCurrentUser();
  const listings = getSellerListings(seller.id, viewer?.id ?? null);
  const reviews = getSellerReviews(seller.id);

  return (
    <main className="px-4 md:px-6">
      <PageHeader title="Profil vendeur" back="/annonces" />

      <section className="glass relative overflow-hidden rounded-[1.75rem] p-5 md:p-7">
        <div className="relative flex items-center gap-4">
          <Avatar name={seller.name} hue={seller.avatar_hue} size={72} />
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold">{seller.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {seller.city && (
                <span className="flex items-center gap-1">
                  <PinIcon size={14} /> {seller.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon size={14} /> Depuis {formatMemberSince(seller.created_at)}
              </span>
            </div>
          </div>
        </div>
        {seller.bio && <p className="relative mt-4 text-[15px] leading-relaxed text-text/85">{seller.bio}</p>}
        <dl className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-ink/40 p-3">
            <dt className="text-xs text-muted">Note</dt>
            <dd className="mt-1 flex flex-col items-center gap-1 text-lg font-bold">
              {seller.rating ? seller.rating.toFixed(1) : "–"}
              {seller.rating && <Stars value={seller.rating} size={10} />}
            </dd>
          </div>
          <div className="rounded-2xl bg-ink/40 p-3">
            <dt className="text-xs text-muted">En vente</dt>
            <dd className="mt-1 text-lg font-bold">{seller.active_listings}</dd>
          </div>
          <div className="rounded-2xl bg-ink/40 p-3">
            <dt className="text-xs text-muted">Avis</dt>
            <dd className="mt-1 text-lg font-bold">{seller.reviews}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Montres en vente</h2>
        {listings.length ? <ListingGrid listings={listings} /> : <p className="text-sm text-muted">Aucune annonce en ligne actuellement.</p>}
      </section>

      <section className="mt-8 max-w-2xl">
        <h2 className="mb-3 text-xl font-bold">Avis des acheteurs</h2>
        <ReviewList reviews={reviews} />
      </section>
    </main>
  );
}
