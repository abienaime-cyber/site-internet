import type { Metadata } from "next";
import Link from "next/link";
import { startConversation } from "@/app/actions/conversations";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { markOrderPaid } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { CheckIcon, ChatIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Confirmation de paiement" };

export default async function ConfirmationPage({ searchParams }: PageProps<"/paiement/confirmation">) {
  const { session_id } = await searchParams;
  const user = await requireUser("/compte");
  const sessionId = typeof session_id === "string" ? session_id : "";

  const order = getDb()
    .prepare(
      `SELECT o.id, o.listing_id, o.amount, o.status, l.brand, l.model
       FROM orders o JOIN listings l ON l.id = o.listing_id
       WHERE o.stripe_session_id = ? AND o.buyer_id = ?`,
    )
    .get(sessionId, user.id) as
    | { id: number; listing_id: number; amount: number; status: string; brand: string; model: string }
    | undefined;

  let paid = order?.status === "paid";
  const stripe = getStripe();
  if (order && !paid && stripe) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        markOrderPaid(sessionId);
        paid = true;
      }
    } catch (error) {
      console.error("Stripe retrieve", error);
    }
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Commande introuvable</h1>
        <p className="mt-2 text-muted">Ce lien de confirmation ne correspond à aucun de vos achats.</p>
        <Link href="/compte" className="mt-6 inline-block rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-ink">
          Mon compte
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14 text-center">
      <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${paid ? "bg-success/15 text-success" : "bg-surface-3 text-muted"}`}>
        <CheckIcon size={38} />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{paid ? "Paiement confirmé" : "Paiement en cours de validation"}</h1>
      <p className="mt-2 text-[15px] text-muted">
        {order.brand} {order.model} · {formatPrice(order.amount)}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-text/85">
        {paid
          ? "La montre est à vous. Le vendeur est prévenu : convenez ensemble de la remise ou de l'envoi."
          : "Stripe n'a pas encore confirmé le paiement. Actualisez cette page dans quelques instants."}
      </p>
      <div className="mt-8 flex flex-col gap-2.5">
        <form action={startConversation}>
          <input type="hidden" name="listingId" value={order.listing_id} />
          <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-semibold text-white">
            <ChatIcon size={19} /> Écrire au vendeur
          </button>
        </form>
        <Link href="/compte" className="grid h-13 place-items-center rounded-2xl border border-line-strong text-[15px] font-semibold">
          Voir mes achats
        </Link>
      </div>
    </main>
  );
}
