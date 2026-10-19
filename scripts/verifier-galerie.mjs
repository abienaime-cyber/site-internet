// Vérifie public/galerie avant publication : pnpm galerie:verifier
// 25 entrées, fichiers présents, licences et crédits complets, images non référencées.
import fs from "node:fs";
import path from "node:path";
import { analyser, cheminImage, lireMontres, MARQUES, PAR_MARQUE } from "../lib/galerie-core.mjs";

const dossier = path.join(process.cwd(), "public", "galerie");
const images = path.join(dossier, "images");
const json = path.join(dossier, "montres.json");
const attendu = MARQUES.length * PAR_MARQUE;

let entrees = [];
const problemes = [];
if (!fs.existsSync(json)) {
  problemes.push({ niveau: "erreur", message: "public/galerie/montres.json introuvable." });
} else {
  const lu = lireMontres(fs.readFileSync(json, "utf8"));
  if (lu.erreur) problemes.push({ niveau: "erreur", message: lu.erreur });
  entrees = lu.entrees;
}

const existe = (relatif) => {
  const complet = path.resolve(images, relatif);
  return complet.startsWith(images + path.sep) && fs.existsSync(complet);
};
const { sections, problemes: regles } = analyser(entrees, existe);
problemes.push(...regles);

if (entrees.length !== attendu) {
  problemes.push({ niveau: "erreur", message: `${entrees.length} entrée(s) dans montres.json, ${attendu} attendues.` });
}

// Images présentes dans le dossier mais citées nulle part dans le JSON.
const citees = new Set(entrees.map(cheminImage).filter(Boolean));
const presentes = fs.existsSync(images)
  ? fs.readdirSync(images, { recursive: true, withFileTypes: true })
      .filter((f) => f.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(f.name))
      .map((f) => path.relative(images, path.join(f.parentPath, f.name)).split(path.sep).join("/"))
  : [];
for (const f of presentes) {
  if (!citees.has(f)) problemes.push({ niveau: "avertissement", message: `images/${f} n'est cité dans aucune entrée.` });
}

const publiees = sections.flatMap((s) => s.emplacements).filter((e) => e.image).length;
console.log(`Galerie : ${publiees}/${attendu} photos publiables.\n`);
for (const { marque, emplacements } of sections) {
  const ok = emplacements.filter((e) => e.image).length;
  console.log(`  ${marque.nom.padEnd(18)} ${ok}/${PAR_MARQUE}`);
}

const erreurs = problemes.filter((p) => p.niveau === "erreur");
const avertissements = problemes.filter((p) => p.niveau === "avertissement");
if (erreurs.length) {
  console.log(`\nÀ compléter (${erreurs.length}) :`);
  erreurs.forEach((p) => console.log(`  - ${p.message}`));
}
if (avertissements.length) {
  console.log(`\nÀ vérifier (${avertissements.length}) :`);
  avertissements.forEach((p) => console.log(`  - ${p.message}`));
}
if (!erreurs.length && !avertissements.length) console.log("\nTout est complet : 25 photos, crédits renseignés.");
process.exitCode = erreurs.length ? 1 : 0;
