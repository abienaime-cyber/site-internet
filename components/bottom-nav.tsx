"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatIcon, HeartIcon, HomeIcon, PlusIcon, UserIcon } from "./icons";

const ITEMS = [
  { href: "/", label: "Accueil", icon: HomeIcon, match: (p: string) => p === "/" || p.startsWith("/annonces") },
  { href: "/favoris", label: "Favoris", icon: HeartIcon, match: (p: string) => p.startsWith("/favoris") },
  { href: "/vendre", label: "Vendre", icon: PlusIcon, match: (p: string) => p.startsWith("/vendre"), primary: true },
  { href: "/messages", label: "Messages", icon: ChatIcon, match: (p: string) => p.startsWith("/messages") },
  { href: "/compte", label: "Profil", icon: UserIcon, match: (p: string) => p.startsWith("/compte") || p.startsWith("/connexion") || p.startsWith("/inscription") },
];

export function BottomNav({ unread, signedIn }: { unread: number; signedIn: boolean }) {
  const pathname = usePathname();
  // Conversation, fiche annonce et paiement ont leur propre barre d'action en bas.
  if (/^\/(messages|annonces)\/\d+/.test(pathname) || pathname.startsWith("/paiement")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-1 rounded-[1.4rem] border border-line bg-[#0d0e12]/95 p-1.5 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]">
        {ITEMS.map(({ href, label, icon: Icon, match, primary }) => {
          const active = match(pathname);
          const target = href === "/compte" && !signedIn ? "/connexion" : href;
          if (primary) {
            return (
              <Link
                key={href}
                href={target}
                aria-label={label}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white shadow-[0_8px_24px_-6px_rgba(63,116,255,0.7)] transition active:scale-95"
              >
                <Icon size={22} />
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={target}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`relative flex h-12 items-center justify-center gap-2 rounded-2xl transition-all active:scale-95 ${
                active ? "bg-text px-4 text-ink" : "w-12 text-muted hover:text-text"
              }`}
            >
              <Icon size={21} />
              {active && <span className="text-sm font-semibold">{label}</span>}
              {href === "/messages" && unread > 0 && (
                <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
