"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function updateProfile(formData: FormData) {
  const user = await requireUser("/compte");
  const city = String(formData.get("city") ?? "").trim().slice(0, 60);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 400);
  getDb().prepare("UPDATE users SET city = ?, bio = ? WHERE id = ?").run(city, bio, user.id);
  revalidatePath("/compte");
}

export async function setListingStatus(formData: FormData) {
  const user = await requireUser("/compte");
  const id = Number(formData.get("listingId"));
  const status = String(formData.get("status"));
  if (!["active", "sold"].includes(status)) return;
  // Une annonce payée via la plateforme ne peut pas être remise en vente.
  getDb()
    .prepare(
      `UPDATE listings SET status = ? WHERE id = ? AND seller_id = ?
       AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.listing_id = listings.id AND o.status = 'paid')`,
    )
    .run(status, id, user.id);
  revalidatePath("/compte");
}

export async function deleteListing(formData: FormData) {
  const user = await requireUser("/compte");
  const id = Number(formData.get("listingId"));
  getDb()
    .prepare(
      `DELETE FROM listings WHERE id = ? AND seller_id = ?
       AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.listing_id = listings.id)`,
    )
    .run(id, user.id);
  revalidatePath("/compte");
}

export async function leaveReview(formData: FormData) {
  const user = await requireUser("/compte");
  const orderId = Number(formData.get("orderId"));
  const rating = Math.round(Number(formData.get("rating")));
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 600);
  if (!(rating >= 1 && rating <= 5)) return;
  const db = getDb();
  const order = db
    .prepare("SELECT id, seller_id FROM orders WHERE id = ? AND buyer_id = ? AND status = 'paid'")
    .get(orderId, user.id) as { id: number; seller_id: number } | undefined;
  if (!order) return;
  db.prepare("INSERT OR IGNORE INTO reviews (seller_id, author_id, order_id, rating, comment) VALUES (?, ?, ?, ?, ?)").run(
    order.seller_id,
    user.id,
    order.id,
    rating,
    comment,
  );
  revalidatePath("/compte");
}
