"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export type CheckoutState = { error?: string } | undefined;

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function startCheckout(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const listingId = Number(formData.get("listingId"));
  const user = await requireUser(`/paiement/${listingId}`);
  const db = getDb();
  const listing = db
    .prepare("SELECT id, seller_id, brand, model, reference, price, status FROM listings WHERE id = ?")
    .get(listingId) as
    | { id: number; seller_id: number; brand: string; model: string; reference: string; price: number; status: string }
    | undefined;

  if (!listing || listing.status !== "active") return { error: "Cette montre n'est plus disponible." };
  if (listing.seller_id === user.id) return { error: "Vous ne pouvez pas acheter votre propre annonce." };

  const stripe = getStripe();
  if (!stripe) return { error: "Le paiement en ligne est momentanément indisponible. Réessayez dans quelques minutes." };

  const origin = await siteOrigin();
  let url: string | null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: listing.price,
            product_data: {
              name: `${listing.brand} ${listing.model}`,
              description: listing.reference ? `Référence ${listing.reference}` : undefined,
            },
          },
        },
      ],
      metadata: { listingId: String(listing.id), buyerId: String(user.id) },
      success_url: `${origin}/paiement/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/paiement/${listing.id}?annule=1`,
    });
    db.prepare(
      "INSERT INTO orders (listing_id, buyer_id, seller_id, amount, status, stripe_session_id) VALUES (?, ?, ?, ?, 'pending', ?)",
    ).run(listing.id, user.id, listing.seller_id, listing.price, session.id);
    url = session.url;
  } catch (error) {
    console.error("Stripe checkout", error);
    return { error: "Le paiement n'a pas pu démarrer. Réessayez dans un instant." };
  }
  if (!url) return { error: "Le paiement n'a pas pu démarrer. Réessayez dans un instant." };
  redirect(url);
}
