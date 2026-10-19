export const BRANDS = [
  "Rolex",
  "Omega",
  "Audemars Piguet",
  "Patek Philippe",
  "Cartier",
  "Tudor",
  "IWC",
  "Breitling",
  "Hublot",
  "Panerai",
  "Seiko",
  "Vacheron Constantin",
  "Jaeger-LeCoultre",
  "TAG Heuer",
  "Zenith",
  "Autre",
] as const;

export const CONDITIONS = [
  { value: "neuf", label: "Jamais portée" },
  { value: "tres_bon", label: "Très bon état" },
  { value: "bon", label: "Bon état" },
  { value: "correct", label: "État correct" },
] as const;

export type Condition = (typeof CONDITIONS)[number]["value"];

export function conditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export const MAX_PRICE_EUR = 500_000;
export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
