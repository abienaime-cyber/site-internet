import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startConversation } from "@/app/actions/conversations";
import { getCurrentUser } from "@/lib/auth";
import { conditionLabel } from "@/lib/constants";
import { formatMemberSince, formatPrice, formatRelative } from "@/lib/format";
import { getListing, incrementViews } from "@/lib/queries";
import { parseVisual } from "@/lib/visual";
import { Avatar } from "@/components/avatar";
import { FavoriteButton } from "@/components/favorite-button";
import { Gallery } from "@/components/gallery";
import {
  ArrowLeftIcon,
  BoxIcon,
  CalendarIcon,
  ChatIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  DocIcon,
  EyeIcon,
  LockIcon,
  PinIcon,
  ShieldIcon,
} from "@/components/icons";
import { RatingBadge } from "@/components/rating";

export async function generateMetadata({ params }: PageProps<"/annonces/[id]">): Promise<Metadata> {
  const { id } = await params;
  const listing = getListing(Number(id), null);
  return { title: listing ? `${listing.brand} ${listing.model}` : "Annonce introuvable" };
}

export default async function ListingPage({ params }: PageProps<"/annonces/[id]">) {
  const { id } = await params;
  const user = await getCurrentUser();
  const listing = getListing(Number(id), user?.id ?? null);
  if (!listing) notFound();

  const isOwner = user?.id === listing.seller_id;
  if (!isOwner) incrementViews(listing.id);
  const available = listing.status === "active";
  const title = `${listing.brand} ${listing.model}`;

  const specs = [
    { label: "Référence", value: listing.reference || "Non précisée" },
    { label: "Année", value: listing.year ? String(listing.year) : "Non précisée" },
    { label: "État", value: conditionLabel(listing.condition) },
    { label: "Diamètre", value: listing.case_size ? `${listing.case_size} mm` : "Non précisé" },
    { label: "Matière", value: listing.material || "Non précisée" },
    { label: "Mouvement", value: listing.movement || "Non précisé" },
  ];

  return (
    <main className="px-4 pt-[max(env(safe-area-inset-top),1rem)] md:px-6 md:pt-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/annonces" aria-label="Retour aux annonces" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface">
          <ArrowLeftIcon size={20} />
        </Link>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">{listing.brand}</p>
        <FavoriteButton listingId={listing.id} initial={Boolean(listing.is_favorite)} size="lg" />
      </div>

      <div className="md:grid md:grid-cols-[1.15fr_1fr] md:gap-8">
        <Gallery photoIds={listing.photo_ids} visual={parseVisual(listing.visual)} alt={title} />

        <div className="mt-5 md:mt-0">
          <div className="flex flex-wrap items-center gap-2">
            {!available && (
              <span className="rounded-full bg-danger/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-danger">
                {listing.status === "sold" ? "Vendue" : "Réservée"}
              </span>
            )}
            <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">{conditionLabel(listing.condition)}</span>
            <span className="flex items-center gap-1 text-xs text-faint">
              <PinIcon size={13} /> {listing.city || listing.seller_city}
            </span>
            <span className="flex items-center gap-1 text-xs text-faint">
              <EyeIcon size={13} /> {listing.views} vues
            </span>
          </div>

          <h1 className="mt-3 text-[1.85rem] font-bold leading-tight tracking-tight">{title}</h1>
          <p className="mt-1 text-[15px] text-muted">
            Réf. {listing.reference || "non précisée"} · publiée {formatRelative(listing.created_at)}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="glass rounded-full px-5 py-2.5 text-2xl font-bold tracking-tight">{formatPrice(listing.price)}</span>
          </div>

          {/* Boîte et papiers */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {[
              { icon: BoxIcon, label: "Boîte d'origine", ok: listing.has_box },
              { icon: DocIcon, label: "Papiers / garantie", ok: listing.has_papers },
            ].map(({ icon: Icon, label, ok }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-muted">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted">{label}</p>
                  <p className={`flex items-center gap-1 text-sm font-semibold ${ok ? "text-success" : "text-muted"}`}>
                    {ok ? <CheckIcon size={14} /> : <CloseIcon size={14} />} {ok ? "Fournis" : "Non fournis"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Caractéristiques */}
          <dl className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-surface">
            {specs.map((s, i) => (
              <div key={s.label} className={`p-3.5 ${i % 2 === 0 ? "border-r border-line" : ""} ${i < specs.length - 2 ? "border-b border-line" : ""}`}>
                <dt className="text-xs text-muted">{s.label}</dt>
                <dd className="mt-0.5 truncate text-[15px] font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <section className="mt-6">
              <h2 className="mb-2 text-lg font-bold">Description du vendeur</h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-text/85">{listing.description}</p>
            </section>
          )}

          {/* Vendeur */}
          <Link
            href={`/vendeurs/${listing.seller_id}`}
            className="mt-6 flex items-center gap-3 rounded-[1.4rem] border border-line bg-surface p-4 transition hover:border-line-strong"
          >
            <Avatar name={listing.seller_name} hue={listing.seller_hue} size={48} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{listing.seller_name}</p>
              <RatingBadge value={listing.seller_rating} count={listing.seller_reviews} />
              <p className="mt-0.5 flex items-center gap-1 text-xs text-faint">
                <CalendarIcon size={12} /> Membre depuis {formatMemberSince(listing.seller_since)}
              </p>
            </div>
            <ChevronRightIcon size={18} className="text-muted" />
          </Link>

          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-accent/10 p-4 text-sm text-text/85">
            <ShieldIcon size={20} className="mt-0.5 shrink-0 text-accent-soft" />
            <p>
              Payez uniquement via Remontoir. Le vendeur ne vous demandera jamais de virement ni de paiement hors plateforme.
            </p>
          </div>

          {/* Actions : barre fixe sur mobile, bloc sur desktop */}
          <div className="fixed inset-x-0 bottom-[5.6rem] z-30 px-4 md:static md:mt-6 md:px-0">
            {isOwner ? (
              <div className="glass mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-ink/70 p-2 pl-4 md:max-w-none">
                <span className="text-sm text-muted">C&apos;est votre annonce</span>
                <Link href="/compte" className="rounded-xl bg-text px-4 py-3 text-sm font-semibold text-ink">
                  Gérer mes annonces
                </Link>
              </div>
            ) : (
              <div className="glass mx-auto flex max-w-md gap-2 rounded-2xl bg-ink/70 p-2 md:max-w-none">
                <form action={startConversation} className="flex-1">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-line-strong text-[15px] font-semibold">
                    <ChatIcon size={19} /> Contacter
                  </button>
                </form>
                {available ? (
                  <Link
                    href={`/paiement/${listing.id}`}
                    className="flex h-13 flex-[1.3] items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(63,116,255,0.8)]"
                  >
                    <LockIcon size={18} /> Acheter
                  </Link>
                ) : (
                  <span className="flex h-13 flex-[1.3] items-center justify-center rounded-xl bg-surface-3 text-[15px] font-semibold text-muted">
                    Plus disponible
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="h-20 md:hidden" />
        </div>
      </div>
    </main>
  );
}
