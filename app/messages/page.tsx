import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatPrice, formatRelative } from "@/lib/format";
import { getConversations } from "@/lib/messages";
import { Avatar } from "@/components/avatar";
import { ChatIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { WatchMedia } from "@/components/watch-media";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireUser("/messages");
  const conversations = getConversations(user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6">
      <PageHeader title="Messages" subtitle="Vos échanges avec les acheteurs et les vendeurs" back="/" />
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center rounded-[1.6rem] border border-dashed border-line-strong px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-muted">
            <ChatIcon size={26} />
          </span>
          <p className="mt-4 text-lg font-semibold">Aucune conversation</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Sur une annonce, touchez « Contacter » pour écrire au vendeur.</p>
          <Link href="/annonces" className="mt-6 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-ink">
            Voir les annonces
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/messages/${c.id}`}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition hover:border-line-strong ${
                  c.unread ? "border-accent/40 bg-accent/[0.07]" : "border-line bg-surface"
                }`}
              >
                <div className="relative">
                  <Avatar name={c.other_name} hue={c.other_hue} size={48} />
                  <div className="stage absolute -bottom-1 -right-1 h-6 w-6 overflow-hidden rounded-md ring-2 ring-ink">
                    <WatchMedia photoId={c.photo_id} visual={c.visual} alt="" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold">{c.other_name}</p>
                    <span className="shrink-0 text-xs text-faint">{formatRelative(c.last_at)}</span>
                  </div>
                  <p className="truncate text-xs text-muted">
                    {c.brand} {c.model} · {formatPrice(c.price)} · {c.role === "buyer" ? "vous achetez" : "vous vendez"}
                  </p>
                  <p className={`mt-0.5 truncate text-sm ${c.unread ? "font-semibold text-text" : "text-muted"}`}>
                    {c.last_body ? `${c.last_sender === user.id ? "Vous : " : ""}${c.last_body}` : "Écrivez votre premier message"}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">{c.unread}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
