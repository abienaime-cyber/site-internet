import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { SellForm } from "@/components/sell-form";

export const metadata: Metadata = { title: "Vendre une montre" };

export default async function SellPage() {
  const user = await requireUser("/vendre");
  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6">
      <PageHeader title="Vendre une montre" subtitle="Une annonce claire et bien photographiée se vend plus vite." back="/" />
      <SellForm defaultCity={user.city} />
    </main>
  );
}
