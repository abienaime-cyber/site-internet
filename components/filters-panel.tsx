"use client";

import { useState } from "react";
import { BRANDS, CONDITIONS } from "@/lib/constants";
import type { SearchFilters } from "@/lib/queries";
import { CloseIcon, SlidersIcon } from "./icons";

const field =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] outline-none placeholder:text-faint focus:border-accent/60";

export function FiltersForm({ filters }: { filters: SearchFilters }) {
  return (
    <form action="/annonces" className="flex flex-col gap-5">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted">Marque</span>
        <select name="marque" defaultValue={filters.brand ?? ""} className={field}>
          <option value="">Toutes les marques</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted">Modèle</span>
        <input name="modele" defaultValue={filters.model ?? ""} placeholder="Submariner, Nautilus…" className={field} />
      </label>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium text-muted">Prix (€)</legend>
        <div className="flex items-center gap-2">
          <input name="prix_min" type="number" min={0} inputMode="numeric" defaultValue={filters.minPrice ?? ""} placeholder="Min" className={field} />
          <span className="text-faint">–</span>
          <input name="prix_max" type="number" min={0} inputMode="numeric" defaultValue={filters.maxPrice ?? ""} placeholder="Max" className={field} />
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-muted">État</legend>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="cursor-pointer">
              <input type="checkbox" name="etat" value={c.value} defaultChecked={filters.condition?.includes(c.value)} className="peer sr-only" />
              <span className="block rounded-full border border-line px-3.5 py-2 text-sm text-muted transition peer-checked:border-text peer-checked:bg-text peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                {c.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-muted">Année</legend>
        <div className="flex items-center gap-2">
          <input name="annee_min" type="number" min={1900} max={2100} inputMode="numeric" defaultValue={filters.yearMin ?? ""} placeholder="De" className={field} />
          <span className="text-faint">–</span>
          <input name="annee_max" type="number" min={1900} max={2100} inputMode="numeric" defaultValue={filters.yearMax ?? ""} placeholder="À" className={field} />
        </div>
      </fieldset>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-3">
        <span className="text-[15px]">Boîte et papiers uniquement</span>
        <input type="checkbox" name="boite_papiers" value="1" defaultChecked={filters.boxPapers} className="h-5 w-5 accent-[var(--color-accent)]" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-muted">Trier par</span>
        <select name="tri" defaultValue={filters.sort} className={field}>
          <option value="recent">Plus récentes</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="year_desc">Année la plus récente</option>
        </select>
      </label>
      <div className="flex gap-2 pt-1">
        <a href={filters.q ? `/annonces?q=${encodeURIComponent(filters.q)}` : "/annonces"} className="grid h-12 flex-1 place-items-center rounded-xl border border-line-strong text-sm font-semibold">
          Réinitialiser
        </a>
        <button type="submit" className="h-12 flex-[1.4] rounded-xl bg-accent text-sm font-semibold text-white">
          Voir les résultats
        </button>
      </div>
    </form>
  );
}

export function FiltersPanel({ filters, initiallyOpen, count }: { filters: SearchFilters; initiallyOpen: boolean; count: number }) {
  const [open, setOpen] = useState(initiallyOpen);
  const form = <FiltersForm filters={filters} />;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold lg:hidden"
      >
        <SlidersIcon size={17} /> Filtres
        {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-white">{count}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <button type="button" aria-label="Fermer" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[1.75rem] border-t border-line-strong bg-surface px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Filtres</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full bg-surface-3">
                <CloseIcon size={18} />
              </button>
            </div>
            {form}
          </div>
        </div>
      )}
    </>
  );
}
