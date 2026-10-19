import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getBrandCounts, searchListings } from "@/lib/queries";
import { parseVisual } from "@/lib/visual";
import { Avatar } from "@/components/avatar";
import { ArrowRightIcon, ArrowUpRightIcon, ChatIcon, LockIcon, ShieldIcon, StarIcon } from "@/components/icons";
import { ListingGrid } from "@/components/listing-grid";
import { LogoMark } from "@/components/logo";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import { WatchArt } from "@/components/watch-art";
import { WatchMedia } from "@/components/watch-media";

const HERO_VISUAL = parseVisual(
  JSON.stringify({ shape: "round", metal: "steel", dial: "#15171c", bezel: "tachy", bezelColor: "#0d0e10", strap: "bracelet", subdials: 3, date: false }),
);

export default async function HomePage() {
  const user = await getCurrentUser();
  const forYou = searchListings({ sort: "recent" }, user?.id ?? null, 8);
  const brands = getBrandCounts();
  const [trending] = searchListings({ sort: "price_desc" }, user?.id ?? null, 1);

  return (
    <main className="px-4 pt-[max(env(safe-area-inset-top),1rem)] md:px-6 md:pt-8">
      {/* En-tête mobile */}
      <div className="mb-5 flex items-center justify-between md:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="Remontoir, accueil">
          <LogoMark size={26} />
          <span className="text-[15px] font-semibold uppercase tracking-[0.2em]">Remontoir</span>
        </Link>
        {user ? (
          <Link href="/compte" aria-label="Mon compte">
            <Avatar name={user.name} hue={user.avatar_hue} size={38} />
          </Link>
        ) : (
          <Link href="/connexion" className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium">
            Connexion
          </Link>
        )}
      </div>

      {/* Hero */}
      <section className="glass relative mb-6 overflow-hidden rounded-[1.75rem] md:grid md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="relative order-2 px-5 pb-5 pt-2 md:order-1 md:p-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted">
            {user ? `Bonjour ${user.name.split(" ")[0]}` : "Entre particuliers"}
          </p>
          <h1 className="text-[2rem] font-light leading-[1.08] tracking-tight md:text-5xl">
            Plus qu&apos;une montre
            <br />
            <span className="font-extrabold">— une histoire.</span>
          </h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
            Achetez et vendez des montres d&apos;exception directement entre passionnés. Paiement sécurisé, échanges en direct.
          </p>
          <Link
            href="/annonces"
            className="mt-5 flex h-14 items-center justify-between overflow-hidden rounded-xl bg-text pl-5 text-[15px] font-semibold text-ink transition active:scale-[0.98] md:max-w-xs"
          >
            Explorer les annonces
            <span className="grid h-full w-16 place-items-center bg-accent text-white">
              <ArrowRightIcon size={22} />
            </span>
          </Link>
        </div>
        <div className="relative order-1 flex h-64 items-center justify-center md:order-2 md:h-[22rem]">
          <WatchArt visual={HERO_VISUAL} className="h-full w-auto rotate-[-8deg] drop-shadow-[0_30px_40px_rgba(0,0,0,0.18)]" />
        </div>
      </section>

      <div className="mb-7 md:hidden">
        <SearchBar />
      </div>

      {/* Marques */}
      <section className="mb-7">
        <SectionHeader title="Marques" href="/annonces" />
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
          {brands.map((b) => (
            <Link
              key={b.brand}
              href={`/annonces?marque=${encodeURIComponent(b.brand)}`}
              className="flex w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2"
            >
              <span className="stage grid h-[5.5rem] w-[5.5rem] place-items-center overflow-hidden rounded-2xl border border-line">
                <WatchArt visual={parseVisual(b.visual)} className="h-[4.6rem] w-auto" />
              </span>
              <span className="w-full truncate text-center text-[13px] font-medium">{b.brand}</span>
              <span className="-mt-2 text-[11px] text-faint">{b.count} annonce{b.count > 1 ? "s" : ""}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pour vous */}
      <section className="mb-8">
        <SectionHeader title="Pour vous" href="/annonces" />
        <ListingGrid listings={forYou} />
      </section>

      {/* Tendance */}
      {trending && (
        <section className="mb-8">
          <SectionHeader title="Pièce d'exception" />
          <Link
            href={`/annonces/${trending.id}`}
            className="glass flex items-center gap-4 rounded-[1.6rem] p-3 pr-4 transition hover:border-line-strong"
          >
            <div className="stage h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
              <WatchMedia photoId={trending.photo_id} visual={trending.visual} alt={`${trending.brand} ${trending.model}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">
                {trending.brand} · {trending.reference}
              </p>
              <p className="truncate text-lg font-semibold">{trending.model}</p>
              <span className="mt-1.5 inline-block rounded-full border border-line-strong px-3 py-1 text-sm font-semibold">
                {formatPrice(trending.price)}
              </span>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong">
              <ArrowUpRightIcon size={18} />
            </span>
          </Link>
        </section>
      )}

      {/* Réassurance */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: LockIcon, title: "Paiement sécurisé", text: "Le paiement passe par Stripe. Aucune donnée bancaire n'est stockée chez nous." },
          { icon: ChatIcon, title: "Messagerie intégrée", text: "Posez vos questions au vendeur sans partager votre numéro." },
          { icon: StarIcon, title: "Vendeurs notés", text: "Chaque achat permet de noter le vendeur. Les avis sont visibles sur son profil." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 rounded-2xl border border-line bg-surface/60 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-accent-soft">
              <Icon size={19} />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          </div>
        ))}
      </section>
      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-faint">
        <ShieldIcon size={14} /> Remontoir · Montres de luxe d&apos;occasion entre particuliers
      </p>
    </main>
  );
}
