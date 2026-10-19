import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { chargerGalerie, type Emplacement } from "@/lib/galerie";
import { PageHeader } from "@/components/page-header";
import { CameraIcon, ChevronRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Cinq montres par maison : Rolex, Audemars Piguet, Richard Mille, Tudor et Patek Philippe.",
};

function Credit({ e }: { e: Emplacement }) {
  if (!e.entree || !e.licence) return null;
  const { auteur, sourceUrl } = e.entree;
  return (
    <p className="mt-2 text-[11px] leading-snug text-faint">
      Photo{" "}
      {auteur && (sourceUrl ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{auteur}</a> : auteur)}
      {auteur && " · "}
      {e.licence.url ? (
        <a href={e.licence.url} target="_blank" rel="noopener noreferrer license" className="underline-offset-2 hover:underline">
          {e.licence.nom}
        </a>
      ) : (
        e.licence.nom
      )}
    </p>
  );
}

function Carte({ e }: { e: Emplacement }) {
  const { entree } = e;
  return (
    <figure className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2">
        {e.image ? (
          <Image
            src={e.image}
            alt={e.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line-strong text-faint" aria-hidden>
            <CameraIcon size={24} />
            <span className="text-xs">Photo à venir</span>
          </div>
        )}
      </div>
      {entree && (entree.modele || entree.reference) && (
        <figcaption className="mt-3">
          {entree.modele && <p className="text-[15px] font-semibold leading-snug">{entree.modele}</p>}
          {entree.reference && <p className="text-xs text-muted">Réf. {entree.reference}</p>}
        </figcaption>
      )}
      {e.image && <Credit e={e} />}
    </figure>
  );
}

export default function GaleriePage() {
  const { sections } = chargerGalerie();

  return (
    <main className="px-4 pb-6 md:px-6">
      <PageHeader title="Galerie" subtitle="Cinq montres par maison." back="/" />

      <div className="flex flex-col gap-14 md:gap-20">
        {sections.map(({ marque, emplacements }) => (
          <section key={marque.slug} aria-labelledby={`marque-${marque.slug}`}>
            <h2 id={`marque-${marque.slug}`} className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-muted">
              {marque.nom}
            </h2>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {emplacements.map((e, i) => (
                <Carte key={i} e={e} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/galerie/credits"
        className="mt-14 inline-flex items-center gap-1 text-sm text-muted transition hover:text-text"
      >
        Crédits photos
        <ChevronRightIcon size={14} />
      </Link>
    </main>
  );
}
