import fs from "node:fs";
import path from "node:path";
import { analyser, lireMontres, MARQUES, PAR_MARQUE, type Entree } from "./galerie-core.mjs";

export { MARQUES, PAR_MARQUE };
export type { Emplacement, Licence, Probleme, SectionMarque } from "./galerie-core.mjs";

// Dossier déposé tel quel : public/galerie/montres.json et public/galerie/images/<marque>/...
export const DOSSIER_GALERIE = path.join(process.cwd(), "public", "galerie");

export function chargerGalerie() {
  const json = path.join(DOSSIER_GALERIE, "montres.json");
  let entrees: Entree[] = [];
  let erreurJson: string | null = null;

  if (!fs.existsSync(json)) {
    erreurJson = "public/galerie/montres.json introuvable.";
  } else {
    const lu = lireMontres(fs.readFileSync(json, "utf8"));
    entrees = lu.entrees;
    erreurJson = lu.erreur;
  }

  const images = path.join(DOSSIER_GALERIE, "images");
  const resultat = analyser(entrees, (relatif) => {
    const complet = path.resolve(images, relatif);
    return complet.startsWith(images + path.sep) && fs.existsSync(complet);
  });
  if (erreurJson) resultat.problemes.unshift({ niveau: "erreur", message: erreurJson });
  return resultat;
}
