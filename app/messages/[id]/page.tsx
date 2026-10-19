import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getConversation, getMessages } from "@/lib/messages";
import { Avatar } from "@/components/avatar";
import { ChatThread } from "@/components/chat-thread";
import { ArrowLeftIcon } from "@/components/icons";
import { WatchMedia } from "@/components/watch-media";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: PageProps<"/messages/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/messages/${id}`);
  const conversation = getConversation(Number(id), user.id);
  if (!conversation) notFound();
  const messages = getMessages(conversation.id, user.id);

  const suggestions =
    conversation.role === "buyer"
      ? ["Bonjour, la montre est-elle toujours disponible ?", "Avez-vous la facture d'achat ?", "Quand a eu lieu la dernière révision ?"]
      : ["Bonjour, merci pour votre message.", "Oui, elle est toujours disponible."];

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col md:min-h-[calc(100dvh-4rem)]">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-xl md:top-16">
        <div className="flex items-center gap-3">
          <Link href="/messages" aria-label="Retour aux messages" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface">
            <ArrowLeftIcon size={19} />
          </Link>
          <Link href={`/vendeurs/${conversation.other_id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
            <Avatar name={conversation.other_name} hue={conversation.other_hue} size={38} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{conversation.other_name}</p>
              <p className="text-xs text-muted">{conversation.role === "buyer" ? "Vendeur" : "Acheteur intéressé"}</p>
            </div>
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2 pr-2.5">
          <Link href={`/annonces/${conversation.listing_id}`} className="stage h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <WatchMedia photoId={conversation.photo_id} visual={conversation.visual} alt={`${conversation.brand} ${conversation.model}`} />
          </Link>
          <Link href={`/annonces/${conversation.listing_id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {conversation.brand} {conversation.model}
            </p>
            <p className="text-sm text-muted">{formatPrice(conversation.price)}</p>
          </Link>
          {conversation.role === "buyer" && conversation.status === "active" && (
            <Link href={`/paiement/${conversation.listing_id}`} className="rounded-xl bg-accent px-3.5 py-2.5 text-sm font-semibold text-white">
              Acheter
            </Link>
          )}
          {conversation.status !== "active" && <span className="rounded-lg bg-surface-3 px-2.5 py-1.5 text-xs text-muted">Vendue</span>}
        </div>
      </header>

      <ChatThread conversationId={conversation.id} userId={user.id} initialMessages={messages} suggestions={suggestions} />
    </main>
  );
}
