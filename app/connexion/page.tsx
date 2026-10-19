import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : "/");
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell title="Bon retour" subtitle="Connectez-vous pour retrouver vos favoris et vos messages.">
      <AuthForm mode="login" next={target} />
    </AuthShell>
  );
}
