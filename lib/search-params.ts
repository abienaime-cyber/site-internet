import { CONDITIONS } from "./constants";
import type { SearchFilters } from "./queries";

type Raw = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function int(value: string | string[] | undefined): number | undefined {
  const n = Number.parseInt(first(value).replace(/\s/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function parseFilters(raw: Raw): SearchFilters {
  const conditions = ([] as string[])
    .concat(raw.etat ?? [])
    .filter((c) => CONDITIONS.some((x) => x.value === c));
  const sort = first(raw.tri);
  return {
    q: first(raw.q) || undefined,
    brand: first(raw.marque) || undefined,
    model: first(raw.modele) || undefined,
    minPrice: int(raw.prix_min),
    maxPrice: int(raw.prix_max),
    condition: conditions.length ? conditions : undefined,
    yearMin: int(raw.annee_min),
    yearMax: int(raw.annee_max),
    boxPapers: first(raw.boite_papiers) === "1",
    sort: (["recent", "price_asc", "price_desc", "year_desc"] as const).find((s) => s === sort) ?? "recent",
  };
}

// Liste des filtres actifs, avec l'URL qui retire chacun d'eux.
export function activeFilterChips(raw: Raw): { label: string; href: string }[] {
  const chips: { label: string; href: string }[] = [];
  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (key === "filtres" || value === undefined) continue;
    for (const v of ([] as string[]).concat(value)) if (v) base.append(key, v);
  }
  const without = (key: string, value?: string) => {
    const params = new URLSearchParams(base);
    if (value === undefined) params.delete(key);
    else params.delete(key, value);
    const s = params.toString();
    return `/annonces${s ? `?${s}` : ""}`;
  };
  const f = parseFilters(raw);
  if (f.q) chips.push({ label: `« ${f.q} »`, href: without("q") });
  if (f.brand) chips.push({ label: f.brand, href: without("marque") });
  if (f.model) chips.push({ label: `Modèle : ${f.model}`, href: without("modele") });
  if (f.minPrice) chips.push({ label: `Dès ${f.minPrice.toLocaleString("fr-FR")} €`, href: without("prix_min") });
  if (f.maxPrice) chips.push({ label: `Jusqu'à ${f.maxPrice.toLocaleString("fr-FR")} €`, href: without("prix_max") });
  for (const c of f.condition ?? []) {
    chips.push({ label: CONDITIONS.find((x) => x.value === c)!.label, href: without("etat", c) });
  }
  if (f.yearMin) chips.push({ label: `Après ${f.yearMin}`, href: without("annee_min") });
  if (f.yearMax) chips.push({ label: `Avant ${f.yearMax}`, href: without("annee_max") });
  if (f.boxPapers) chips.push({ label: "Boîte et papiers", href: without("boite_papiers") });
  return chips;
}
