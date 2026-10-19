const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number): string {
  return priceFormatter.format(Math.round(cents / 100));
}

// SQLite stocke les dates en UTC sans fuseau : on le précise avant de parser.
export function parseDbDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

export function formatRelative(value: string): string {
  const diff = Date.now() - parseDbDate(value).getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  return parseDbDate(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatTime(value: string): string {
  return parseDbDate(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}

export function formatMemberSince(value: string): string {
  return parseDbDate(value).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function shortName(name: string): string {
  const [first, last] = name.split(/\s+/);
  return last ? `${first} ${last[0]}.` : first;
}
