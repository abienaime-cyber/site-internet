import type { Metadata } from "next";
import Link from "next/link";
import { deleteListing, leaveReview, setListingStatus, updateProfile } from "@/app/actions/account";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { formatMemberSince, formatPrice, formatRelative } from "@/lib/format";
import { getPurchases, getSales, getSellerListings, getSeller } from "@/lib/queries";
import { Avatar } from "@/components/avatar";
import { ChevronRightIcon, HeartIcon, LogoutIcon, PlusIcon, StarIcon, TrashIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { WatchMedia } from "@/components/watch-media";

export const metadata: Metadata = { title: "Mon compte" };

const field = "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[15px] outline-none placeholder:text-faint focus:border-accent/60";

export default async function AccountPage() {
  const user = await requireUser("/compte");
  const profile = getSeller(user.id)!;
  const listings = getSellerListings(user.id, user.id, true);
  const purchases = getPurchases(user.id);
  const sales = getSales(user.id);

  return (
    <main className="px-4 md:px-6">
      <PageHeader
        title="Mon compte"
        action={
          <form action={logout}>
            <button type="submit" className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-medium text-muted">
              <LogoutIcon size={17} /> Déconnexion
            </button>
          </form>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="glass rounded-[1.6rem] p-5">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} hue={user.avatar_hue} size={60} />
              <div className="min-w-0">
                <p className="truncate text-xl font-bold">{user.name}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
                <p className="text-xs text-faint">Membre depuis {formatMemberSince(user.created_at)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/vendeurs/${user.id}`} className="flex items-center justify-between rounded-xl bg-ink/40 px-3.5 py-3 text-sm">
                Profil public <ChevronRightIcon size={15} className="text-muted" />
              </Link>
              <Link href="/favoris" className="flex items-center justify-between rounded-xl bg-ink/40 px-3.5 py-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <HeartIcon size={15} /> Favoris
                </span>
                <ChevronRightIcon size={15} className="text-muted" />
              </Link>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
              <StarIcon size={14} className="text-gold" />
              {profile.rating ? `${profile.rating.toFixed(1)} / 5 sur ${profile.reviews} avis` : "Pas encore d'avis reçu"}
            </p>
          </section>

          <form action={updateProfile} className="flex flex-col gap-3 rounded-[1.6rem] border border-line bg-surface p-5">
            <h2 className="text-lg font-bold">Profil vendeur</h2>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Ville</span>
              <input name="city" defaultValue={user.city} placeholder="Paris" className={field} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-muted">Présentation</span>
              <textarea name="bio" rows={3} defaultValue={user.bio} placeholder="Collectionneur, montres de plongée…" className={field} />
            </label>
            <button type="submit" className="h-11 rounded-xl bg-text text-sm font-semibold text-ink">
              Enregistrer
            </button>
          </form>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Mes annonces</h2>
              <Link href="/vendre" className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
                <PlusIcon size={15} /> Déposer
              </Link>
            </div>
            {listings.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong p-6 text-center text-sm text-muted">
                Vous n&apos;avez encore rien mis en vente.
              </p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {listings.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 pr-3 sm:flex-nowrap">
                    <Link href={`/annonces/${l.id}`} className="stage h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <WatchMedia photoId={l.photo_id} visual={l.visual} alt={`${l.brand} ${l.model}`} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/annonces/${l.id}`} className="block truncate font-semibold">
                        {l.brand} {l.model}
                      </Link>
                      <p className="text-sm text-muted">
                        {formatPrice(l.price)} ·{" "}
                        <span className={l.status === "active" ? "text-success" : "text-faint"}>
                          {l.status === "active" ? "En ligne" : "Vendue"}
                        </span>
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                    <form action={setListingStatus}>
                      <input type="hidden" name="listingId" value={l.id} />
                      <input type="hidden" name="status" value={l.status === "active" ? "sold" : "active"} />
                      <button type="submit" className="rounded-lg border border-line px-3 py-2 text-xs font-medium">
                        {l.status === "active" ? "Marquer vendue" : "Remettre en vente"}
                      </button>
                    </form>
                    <form action={deleteListing}>
                      <input type="hidden" name="listingId" value={l.id} />
                      <button type="submit" aria-label="Supprimer l'annonce" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-danger">
                        <TrashIcon size={17} />
                      </button>
                    </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">Mes achats</h2>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted">Aucun achat pour le moment.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {purchases.map((o) => (
                  <li key={o.id} className="rounded-2xl border border-line bg-surface p-3">
                    <div className="flex items-center gap-3">
                      <div className="stage h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <WatchMedia photoId={o.photo_id} visual={o.visual} alt={`${o.brand} ${o.model}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {o.brand} {o.model}
                        </p>
                        <p className="text-sm text-muted">
                          {formatPrice(o.amount)} · payée {formatRelative(o.paid_at ?? o.created_at)} · vendeur {o.other_name}
                        </p>
                      </div>
                    </div>
                    {!o.reviewed && (
                      <form action={leaveReview} className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
                        <input type="hidden" name="orderId" value={o.id} />
                        <p className="text-sm font-medium">Notez le vendeur</p>
                        <div className="flex flex-row-reverse justify-end gap-1">
                          {[5, 4, 3, 2, 1].map((n) => (
                            <label key={n} className="cursor-pointer">
                              <input type="radio" name="rating" value={n} required className="peer sr-only" />
                              <span className="block rounded-lg border border-line px-2.5 py-1.5 text-sm text-muted peer-checked:border-gold peer-checked:text-gold">
                                {n} ★
                              </span>
                            </label>
                          ))}
                        </div>
                        <input name="comment" placeholder="Votre avis en une phrase (facultatif)" className={field} />
                        <button type="submit" className="h-10 rounded-xl bg-text text-sm font-semibold text-ink">
                          Publier l&apos;avis
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {sales.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Mes ventes</h2>
              <ul className="flex flex-col gap-2.5">
                {sales.map((o) => (
                  <li key={o.id} className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 text-sm">
                    <span className="truncate">
                      {o.brand} {o.model} · acheteur {o.other_name}
                    </span>
                    <span className="font-semibold text-success">{formatPrice(o.amount)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
