"use client";

import { useActionState } from "react";
import { startCheckout, type CheckoutState } from "@/app/actions/checkout";
import { LockIcon } from "./icons";

export function PayButton({ listingId, label }: { listingId: number; label: string }) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="listingId" value={listingId} />
      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-semibold text-white shadow-[0_12px_30px_-10px_rgba(63,116,255,0.8)] transition disabled:opacity-60"
      >
        <LockIcon size={18} />
        {pending ? "Redirection vers le paiement…" : label}
      </button>
    </form>
  );
}
