"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function toggleFavorite(listingId: number): Promise<{ ok: boolean; favorite?: boolean; needsLogin?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, needsLogin: true };
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM favorites WHERE user_id = ? AND listing_id = ?").get(user.id, listingId);
  if (exists) {
    db.prepare("DELETE FROM favorites WHERE user_id = ? AND listing_id = ?").run(user.id, listingId);
  } else {
    const listing = db.prepare("SELECT id FROM listings WHERE id = ?").get(listingId);
    if (!listing) return { ok: false };
    db.prepare("INSERT INTO favorites (user_id, listing_id) VALUES (?, ?)").run(user.id, listingId);
  }
  revalidatePath("/favoris");
  return { ok: true, favorite: !exists };
}
