import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M16 16V8.5M16 16l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="28" y="14" width="3" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-text" aria-label="Remontoir, accueil">
      <LogoMark />
      <span className="text-lg font-semibold tracking-[0.18em] uppercase">Remontoir</span>
    </Link>
  );
}
