import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { countUnread } from "@/lib/queries";
import { BottomNav } from "./bottom-nav";
import { Avatar } from "./avatar";
import { ChatIcon, HeartIcon, PlusIcon, SearchIcon } from "./icons";
import { Logo } from "./logo";

export async function AppNav() {
  const user = await getCurrentUser();
  const unread = user ? countUnread(user.id) : 0;

  return (
    <>
      <header className="sticky top-0 z-40 hidden border-b border-line bg-ink/70 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Logo />
          <form action="/annonces" className="relative ml-4 flex-1 max-w-md">
            <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Rolex, Speedmaster, 126610LN…"
              className="h-10 w-full rounded-full border border-line bg-surface/80 pl-10 pr-4 text-sm outline-none placeholder:text-faint focus:border-accent/60"
            />
          </form>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/annonces" className="rounded-full px-3 py-2 text-muted transition hover:text-text">
              Acheter
            </Link>
            <Link href="/favoris" className="rounded-full p-2.5 text-muted transition hover:text-text" aria-label="Favoris">
              <HeartIcon />
            </Link>
            <Link href="/messages" className="relative rounded-full p-2.5 text-muted transition hover:text-text" aria-label="Messages">
              <ChatIcon />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <Link
              href="/vendre"
              className="ml-2 flex items-center gap-1.5 rounded-full bg-text px-4 py-2 font-semibold text-ink transition hover:bg-white"
            >
              <PlusIcon size={16} /> Vendre
            </Link>
            {user ? (
              <Link href="/compte" className="ml-2" aria-label="Mon compte">
                <Avatar name={user.name} hue={user.avatar_hue} size={36} />
              </Link>
            ) : (
              <Link href="/connexion" className="ml-2 rounded-full border border-line-strong px-4 py-2 font-medium hover:bg-white/5">
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>
      <BottomNav unread={unread} signedIn={Boolean(user)} />
    </>
  );
}
