import { formatRelative, shortName } from "@/lib/format";
import type { Review } from "@/lib/queries";
import { Avatar } from "./avatar";
import { Stars } from "./rating";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return <p className="text-sm text-muted">Pas encore d&apos;avis.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-line bg-surface p-4">
          <div className="flex items-center gap-3">
            <Avatar name={r.author_name} hue={r.author_hue} size={34} />
            <div className="flex-1">
              <p className="text-sm font-semibold">{shortName(r.author_name)}</p>
              <p className="text-xs text-faint">{formatRelative(r.created_at)}</p>
            </div>
            <Stars value={r.rating} size={13} />
          </div>
          {r.comment && <p className="mt-2.5 text-[15px] leading-relaxed text-text/85">{r.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
