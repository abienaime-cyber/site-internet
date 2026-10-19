import Link from "next/link";
import { SearchIcon, SlidersIcon } from "./icons";

export function SearchBar({ defaultValue = "", filtersHref = "/annonces?filtres=1" }: { defaultValue?: string; filtersHref?: string }) {
  return (
    <div className="flex gap-2.5">
      <form action="/annonces" className="relative flex-1">
        <SearchIcon size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Rechercher une montre…"
          aria-label="Rechercher une montre"
          className="h-13 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[15px] outline-none placeholder:text-faint focus:border-accent/60"
        />
      </form>
      <Link
        href={filtersHref}
        aria-label="Filtres"
        className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-text text-ink transition active:scale-95"
      >
        <SlidersIcon size={20} />
      </Link>
    </div>
  );
}
