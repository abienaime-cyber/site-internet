import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignupPage({ searchParams }: PageProps<"/inscription">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : "/");
  if (await getCurrentUser()) redirect(target);
  return (
    <AuthShell title="Créer un compte" subtitle="Achetez, vendez et échangez avec d'autres passionnés.">
      <AuthForm mode="signup" next={target} />
    </AuthShell>
  );
}
