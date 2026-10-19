import { getDb, transaction } from "./db";

// Idempotent : appelée depuis la page de confirmation et depuis le webhook Stripe.
export function markOrderPaid(stripeSessionId: string): number | null {
  const db = getDb();
  return transaction(() => {
    const order = db
      .prepare("SELECT id, listing_id, status FROM orders WHERE stripe_session_id = ?")
      .get(stripeSessionId) as { id: number; listing_id: number; status: string } | undefined;
    if (!order) return null;
    if (order.status !== "paid") {
      db.prepare("UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE id = ?").run(order.id);
      db.prepare("UPDATE listings SET status = 'sold' WHERE id = ?").run(order.listing_id);
    }
    return order.id;
  });
}
