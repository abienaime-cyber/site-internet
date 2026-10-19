import Link from "next/link";
import { ChevronRightIcon } from "./icons";

export function SectionHeader({ title, href, linkLabel = "Tout voir" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-sm text-muted transition hover:text-text">
          {linkLabel}
          <span className="grid h-5 w-5 place-items-center rounded-md bg-surface-2">
            <ChevronRightIcon size={12} />
          </span>
        </Link>
      )}
    </div>
  );
}
