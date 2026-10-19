"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";

const input =
  "h-13 w-full rounded-2xl border border-line bg-surface px-4 text-[15px] outline-none placeholder:text-faint focus:border-accent/60";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const fields = state?.fields ?? {};
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Prénom et nom</span>
          <input name="name" required autoComplete="name" defaultValue={fields.name} placeholder="Camille Martin" className={input} />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">E-mail</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={fields.email} placeholder="vous@exemple.fr" className={input} />
      </label>
      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Ville</span>
          <input name="city" autoComplete="address-level2" defaultValue={fields.city} placeholder="Paris" className={input} />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Mot de passe</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : undefined}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "8 caractères minimum" : "••••••••"}
          className={input}
        />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-14 rounded-2xl bg-accent text-[15px] font-semibold text-white transition disabled:opacity-60"
      >
        {pending ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>

      <p className="mt-2 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link href={`/inscription${nextQuery}`} className="font-semibold text-text underline-offset-4 hover:underline">
              S&apos;inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <Link href={`/connexion${nextQuery}`} className="font-semibold text-text underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
