"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { getDb, transaction } from "@/lib/db";

export async function startConversation(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  const user = await requireUser(`/annonces/${listingId}`);
  const db = getDb();
  const listing = db.prepare("SELECT id, seller_id FROM listings WHERE id = ?").get(listingId) as
    | { id: number; seller_id: number }
    | undefined;
  if (!listing) redirect("/annonces");
  if (listing.seller_id === user.id) redirect(`/annonces/${listingId}`);

  db.prepare("INSERT OR IGNORE INTO conversations (listing_id, buyer_id, seller_id) VALUES (?, ?, ?)").run(
    listingId,
    user.id,
    listing.seller_id,
  );
  const conversation = db
    .prepare("SELECT id FROM conversations WHERE listing_id = ? AND buyer_id = ?")
    .get(listingId, user.id) as { id: number };
  redirect(`/messages/${conversation.id}`);
}

export type SendResult = { ok: boolean; error?: string };

export async function sendMessage(conversationId: number, body: string): Promise<SendResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  const text = body.trim();
  if (!text) return { ok: false, error: "Le message est vide." };
  if (text.length > 2000) return { ok: false, error: "Le message dépasse 2 000 caractères." };

  const db = getDb();
  const conversation = db
    .prepare("SELECT id FROM conversations WHERE id = ? AND (buyer_id = ? OR seller_id = ?)")
    .get(conversationId, user.id, user.id);
  if (!conversation) return { ok: false, error: "Conversation introuvable." };

  transaction(() => {
    db.prepare("INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)").run(conversationId, user.id, text);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversationId);
  });
  revalidatePath("/messages");
  return { ok: true };
}
