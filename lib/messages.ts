import { getDb } from "./db";

export type ConversationSummary = {
  id: number;
  listing_id: number;
  brand: string;
  model: string;
  price: number;
  visual: string;
  photo_id: number | null;
  other_id: number;
  other_name: string;
  other_hue: number;
  role: "buyer" | "seller";
  last_body: string | null;
  last_sender: number | null;
  last_at: string;
  unread: number;
};

export function getConversations(userId: number): ConversationSummary[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.listing_id, l.brand, l.model, l.price, l.visual,
        (SELECT p.id FROM listing_photos p WHERE p.listing_id = l.id ORDER BY p.position LIMIT 1) AS photo_id,
        u.id AS other_id, u.name AS other_name, u.avatar_hue AS other_hue,
        CASE WHEN c.buyer_id = :u THEN 'buyer' ELSE 'seller' END AS role,
        (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_body,
        (SELECT sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_sender,
        c.updated_at AS last_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != :u AND m.read_at IS NULL) AS unread
       FROM conversations c
       JOIN listings l ON l.id = c.listing_id
       JOIN users u ON u.id = CASE WHEN c.buyer_id = :u THEN c.seller_id ELSE c.buyer_id END
       WHERE (c.buyer_id = :u OR c.seller_id = :u)
         AND (c.buyer_id = :u OR EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id))
       ORDER BY c.updated_at DESC, c.id DESC`,
    )
    .all({ u: userId }) as ConversationSummary[];
}

export type ConversationDetail = Omit<ConversationSummary, "last_body" | "last_sender" | "last_at" | "unread"> & {
  status: string;
  reference: string;
};

export function getConversation(id: number, userId: number): ConversationDetail | null {
  return (
    (getDb()
      .prepare(
        `SELECT c.id, c.listing_id, l.brand, l.model, l.price, l.visual, l.status, l.reference,
          (SELECT p.id FROM listing_photos p WHERE p.listing_id = l.id ORDER BY p.position LIMIT 1) AS photo_id,
          u.id AS other_id, u.name AS other_name, u.avatar_hue AS other_hue,
          CASE WHEN c.buyer_id = :u THEN 'buyer' ELSE 'seller' END AS role
         FROM conversations c
         JOIN listings l ON l.id = c.listing_id
         JOIN users u ON u.id = CASE WHEN c.buyer_id = :u THEN c.seller_id ELSE c.buyer_id END
         WHERE c.id = :id AND (c.buyer_id = :u OR c.seller_id = :u)`,
      )
      .get({ id, u: userId }) as ConversationDetail | undefined) ?? null
  );
}

export type Message = { id: number; sender_id: number; body: string; created_at: string; read_at: string | null };

// À n'appeler qu'après avoir vérifié que l'utilisateur participe à la conversation.
export function getMessages(conversationId: number, userId: number, afterId = 0): Message[] {
  const db = getDb();
  db.prepare(
    "UPDATE messages SET read_at = datetime('now') WHERE conversation_id = ? AND sender_id != ? AND read_at IS NULL",
  ).run(conversationId, userId);
  return db
    .prepare("SELECT id, sender_id, body, created_at, read_at FROM messages WHERE conversation_id = ? AND id > ? ORDER BY id")
    .all(conversationId, afterId) as Message[];
}
