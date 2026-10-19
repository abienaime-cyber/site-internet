import type { Metadata } from "next";
import { chargerGalerie } from "@/lib/galerie";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Crédits photos" };

export default function CreditsPage() {
  const { sections } = chargerGalerie();
  const photos = sections.flatMap(({ marque, emplacements }) =>
    emplacements.filter((e) => e.image && e.entree && e.licence).map((e) => ({ marque: marque.nom, ...e })),
  );

  return (
    <main className="px-4 pb-6 md:px-6">
      <PageHeader title="Crédits photos" subtitle="Auteur, licence et source de chaque photo de la galerie." back="/galerie" />

      {photos.length === 0 ? (
        <p className="text-[15px] text-muted">Aucune photo publiée pour le moment.</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {photos.map((p, i) => {
            const e = p.entree!;
            return (
              <li key={i} className="flex flex-col gap-1 px-4 py-3.5 text-sm sm:flex-row sm:items-baseline sm:gap-4">
                <span className="font-semibold sm:w-56 sm:shrink-0">
                  {[p.marque, e.modele].filter(Boolean).join(" ")}
                  {e.reference && <span className="font-normal text-muted"> · {e.reference}</span>}
                </span>
                <span className="text-muted">
                  {e.auteur ?? "Auteur non requis par la licence"}
                  {" · "}
                  {p.licence!.url ? (
                    <a href={p.licence!.url} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2">
                      {p.licence!.nom}
                    </a>
                  ) : (
                    p.licence!.nom
                  )}
                  {e.sourceUrl && (
                    <>
                      {" · "}
                      <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                        Source
                      </a>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
