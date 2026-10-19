import { StarIcon } from "./icons";

export function Stars({ value, size = 11 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[1px] text-gold" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} size={size} filled={i < Math.round(value)} className={i < Math.round(value) ? "" : "text-faint"} />
      ))}
    </span>
  );
}

export function RatingBadge({ value, count }: { value: number | null; count: number }) {
  if (!value || count === 0) return <span className="text-[11px] text-faint">Nouveau vendeur</span>;
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Vendeur noté ${value} sur 5, ${count} avis`}>
      <Stars value={value} />
      <span className="text-[11px] font-medium text-muted">{value.toFixed(1)}</span>
    </span>
  );
}
