import Link from "next/link";
import { ArrowLeftIcon } from "./icons";

export function PageHeader({ title, subtitle, back, action }: { title: string; subtitle?: string; back?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 pt-[max(env(safe-area-inset-top),1rem)] md:pt-8">
      <div className="mb-4 flex items-center justify-between md:hidden">
        {back ? (
          <Link href={back} aria-label="Retour" className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface">
            <ArrowLeftIcon size={20} />
          </Link>
        ) : (
          <span />
        )}
        {action}
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem] font-bold leading-tight tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
        </div>
        {action && <div className="hidden md:block">{action}</div>}
      </div>
    </div>
  );
}
