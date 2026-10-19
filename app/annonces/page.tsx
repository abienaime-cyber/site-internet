import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { searchListings } from "@/lib/queries";
import { activeFilterChips, parseFilters } from "@/lib/search-params";
import { FiltersForm, FiltersPanel } from "@/components/filters-panel";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { ListingGrid } from "@/components/listing-grid";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Annonces" };

export default async function ListingsPage({ searchParams }: PageProps<"/annonces">) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const user = await getCurrentUser();
  const listings = searchListings(filters, user?.id ?? null);
  const chips = activeFilterChips(raw);
  const filterCount = chips.filter((c) => !c.label.startsWith("«")).length;

  return (
    <main className="px-4 md:px-6">
      <PageHeader title="Annonces" subtitle="Montres de luxe d'occasion, vendues par des particuliers" back="/" />

      <div className="mb-4 flex gap-2.5">
        <form action="/annonces" className="relative flex-1">
          {Object.entries(raw).flatMap(([key, value]) =>
            key === "q" || key === "filtres" || value === undefined
              ? []
              : ([] as string[]).concat(value).map((v, i) => <input key={`${key}-${i}`} type="hidden" name={key} value={v} />),
          )}
          <SearchIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Marque, modèle ou référence"
            aria-label="Rechercher"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[15px] outline-none placeholder:text-faint focus:border-accent/60"
          />
        </form>
        <FiltersPanel key={JSON.stringify(raw)} filters={filters} initiallyOpen={raw.filtres === "1"} count={filterCount} />
      </div>

      <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[1.4rem] border border-line bg-surface p-5">
            <h2 className="mb-4 text-lg font-bold">Filtres</h2>
            <FiltersForm key={JSON.stringify(raw)} filters={filters} />
          </div>
        </aside>
        <section>
          {chips.length > 0 && (
            <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
              {chips.map((chip) => (
                <Link key={chip.href + chip.label} href={chip.href} className="flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm">
                  {chip.label}
                  <CloseIcon size={13} className="text-muted" />
                </Link>
              ))}
            </div>
          )}
          <p className="mb-3 text-sm text-muted">
            {listings.length} montre{listings.length > 1 ? "s" : ""} disponible{listings.length > 1 ? "s" : ""}
          </p>
          {listings.length > 0 ? (
            <ListingGrid listings={listings} wide />
          ) : (
            <div className="rounded-[1.4rem] border border-dashed border-line-strong px-6 py-14 text-center">
              <p className="text-lg font-semibold">Aucune montre ne correspond</p>
              <p className="mt-1 text-sm text-muted">Élargissez la fourchette de prix ou retirez un filtre.</p>
              <Link href="/annonces" className="mt-5 inline-block rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-ink">
                Voir toutes les annonces
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
