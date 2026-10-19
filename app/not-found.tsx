import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="text-muted">
        <LogoMark size={48} />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Page introuvable</h1>
      <p className="mt-2 text-muted">Cette annonce a peut-être été retirée par son vendeur.</p>
      <Link href="/annonces" className="mt-8 rounded-full bg-text px-6 py-3 text-sm font-semibold text-ink">
        Voir les annonces
      </Link>
    </main>
  );
}
