import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { conditionLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { getListing } from "@/lib/queries";
import { Avatar } from "@/components/avatar";
import { ArrowLeftIcon, BoxIcon, ChatIcon, DocIcon, LockIcon, ShieldIcon } from "@/components/icons";
import { PayButton } from "@/components/pay-button";
import { WatchMedia } from "@/components/watch-media";

export const metadata: Metadata = { title: "Paiement" };

export default async function CheckoutPage({ params, searchParams }: PageProps<"/paiement/[id]">) {
  const { id } = await params;
  const { annule } = await searchParams;
  const user = await requireUser(`/paiement/${id}`);
  const listing = getListing(Number(id), user.id);
  if (!listing) notFound();
  if (listing.seller_id === user.id) redirect(`/annonces/${listing.id}`);
  const available = listing.status === "active";

  return (
    <main className="mx-auto max-w-xl px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)] md:pt-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href={`/annonces/${listing.id}`} aria-label="Retour à l'annonce" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface">
          <ArrowLeftIcon size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Paiement sécurisé</h1>
      </div>

      {annule === "1" && (
        <p className="mb-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted">
          Paiement interrompu. Aucun montant n&apos;a été débité, vous pouvez réessayer quand vous voulez.
        </p>
      )}

      <section className="glass relative overflow-hidden rounded-[1.75rem] p-4">
        <div className="relative flex gap-4">
          <div className="stage h-28 w-28 shrink-0 overflow-hidden rounded-2xl">
            <WatchMedia photoId={listing.photo_id} visual={listing.visual} alt={`${listing.brand} ${listing.model}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{listing.brand}</p>
            <p className="text-lg font-semibold leading-snug">{listing.model}</p>
            <p className="text-sm text-faint">
              Réf. {listing.reference || "non précisée"}
              {listing.year ? ` · ${listing.year}` : ""}
            </p>
            <p className="mt-1 text-sm text-muted">{conditionLabel(listing.condition)}</p>
          </div>
        </div>
        <div className="relative mt-4 flex gap-2 text-xs">
          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${listing.has_box ? "border-success/40 text-success" : "border-line text-faint"}`}>
            <BoxIcon size={13} /> {listing.has_box ? "Avec boîte" : "Sans boîte"}
          </span>
          <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${listing.has_papers ? "border-success/40 text-success" : "border-line text-faint"}`}>
            <DocIcon size={13} /> {listing.has_papers ? "Avec papiers" : "Sans papiers"}
          </span>
        </div>
      </section>

      <section className="mt-4 rounded-[1.5rem] border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name={listing.seller_name} hue={listing.seller_hue} size={40} />
          <div className="flex-1">
            <p className="text-xs text-muted">Vendu par</p>
            <p className="font-semibold">{listing.seller_name}</p>
          </div>
          <Link href={`/vendeurs/${listing.seller_id}`} className="text-sm text-muted underline-offset-4 hover:underline">
            Voir le profil
          </Link>
        </div>
        <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-muted">Prix de la montre</dt>
            <dd>{formatPrice(listing.price)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Remise</dt>
            <dd className="text-muted">À convenir avec le vendeur</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-lg font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(listing.price)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-5">
        {available ? (
          <PayButton listingId={listing.id} label={`Payer ${formatPrice(listing.price)}`} />
        ) : (
          <p className="rounded-2xl bg-surface-3 px-4 py-4 text-center font-semibold text-muted">Cette montre n&apos;est plus disponible.</p>
        )}
      </div>

      <ul className="mt-5 flex flex-col gap-3 text-sm text-muted">
        <li className="flex gap-3">
          <LockIcon size={18} className="mt-0.5 shrink-0 text-accent-soft" />
          Vous saisissez votre carte sur la page de paiement Stripe. Remontoir ne voit ni ne stocke vos coordonnées bancaires.
        </li>
        <li className="flex gap-3">
          <ShieldIcon size={18} className="mt-0.5 shrink-0 text-accent-soft" />
          Dès la confirmation du paiement, l&apos;annonce passe en « Vendue » et n&apos;est plus proposée aux autres acheteurs.
        </li>
        <li className="flex gap-3">
          <ChatIcon size={18} className="mt-0.5 shrink-0 text-accent-soft" />
          Organisez la remise ou l&apos;envoi avec le vendeur depuis la messagerie.
        </li>
      </ul>
    </main>
  );
}
