// @ts-check
// Règles de la galerie, partagées par la page /galerie et par scripts/verifier-galerie.mjs.
// montres.json est la seule source de vérité : rien n'est deviné ni complété ici.

/** @typedef {{ slug: string; nom: string }} Marque */

/** @type {Marque[]} */
export const MARQUES = [
  { slug: "rolex", nom: "Rolex" },
  { slug: "audemars-piguet", nom: "Audemars Piguet" },
  { slug: "richard-mille", nom: "Richard Mille" },
  { slug: "tudor", nom: "Tudor" },
  { slug: "patek-philippe", nom: "Patek Philippe" },
];

export const PAR_MARQUE = 5;

/**
 * @typedef {{
 *   marque: string | null;
 *   modele: string | null;
 *   reference: string | null;
 *   fichier: string | null;
 *   auteur: string | null;
 *   licence: string | null;
 *   sourceUrl: string | null;
 *   alt: string | null;
 * }} Entree
 *
 * @typedef {{ nom: string; url: string | null; attribution: boolean }} Licence
 *
 * @typedef {{
 *   entree: Entree | null;
 *   image: string | null;
 *   alt: string;
 *   licence: Licence | null;
 *   manque: string | null;
 * }} Emplacement
 *
 * @typedef {{ marque: Marque; emplacements: Emplacement[] }} SectionMarque
 *
 * @typedef {{ niveau: "erreur" | "avertissement"; message: string }} Probleme
 */

/** @param {string} s */
export function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** @param {unknown} v @returns {string | null} */
function texte(v) {
  if (typeof v !== "string" && typeof v !== "number") return null;
  const s = String(v).trim();
  return s ? s : null;
}

/**
 * Accepte les clés avec ou sans accents (modele / modèle, reference / référence).
 * @param {Record<string, unknown>} brut
 * @returns {Entree}
 */
export function normaliser(brut) {
  return {
    marque: texte(brut.marque),
    modele: texte(brut.modele ?? brut["modèle"]),
    reference: texte(brut.reference ?? brut["référence"]),
    fichier: texte(brut.fichier),
    auteur: texte(brut.auteur),
    licence: texte(brut.licence),
    sourceUrl: texte(brut.source_url),
    alt: texte(brut.alt),
  };
}

/**
 * Lit le contenu de montres.json : un tableau, ou un objet { montres: [...] }.
 * @param {string} contenu
 * @returns {{ entrees: Entree[]; erreur: string | null }}
 */
export function lireMontres(contenu) {
  let donnees;
  try {
    donnees = JSON.parse(contenu);
  } catch (e) {
    return { entrees: [], erreur: `montres.json n'est pas un JSON valide (${e instanceof Error ? e.message : e}).` };
  }
  const liste = Array.isArray(donnees) ? donnees : donnees?.montres;
  if (!Array.isArray(liste)) {
    return { entrees: [], erreur: "montres.json doit contenir un tableau de montres (ou un objet avec une clé « montres »)." };
  }
  return { entrees: liste.filter((x) => x && typeof x === "object").map(normaliser), erreur: null };
}

/**
 * Licence → nom affiché, lien vers le texte officiel, et si l'auteur doit être crédité.
 * Le lien n'est construit que pour les licences Creative Commons dont la version est indiquée.
 * @param {string} licence
 * @returns {Licence}
 */
export function infoLicence(licence) {
  const l = licence.trim();
  if (/^(cc0|cc[\s-]?zero)\b/i.test(l)) {
    return { nom: l, url: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: false };
  }
  if (/domaine public|public domain/i.test(l)) {
    return { nom: l, url: null, attribution: false };
  }
  const cc = l.match(/^cc[\s-]*(by(?:[\s-](?:sa|nd|nc))*)(?:[\s-]+(\d\.\d))?/i);
  if (cc) {
    const type = cc[1].toLowerCase().replace(/\s+/g, "-");
    return { nom: l, url: cc[2] ? `https://creativecommons.org/licenses/${type}/${cc[2]}/` : null, attribution: true };
  }
  // Licence non reconnue : on exige le crédit par prudence.
  return { nom: l, url: null, attribution: true };
}

/**
 * Chemin de l'image sous images/ : « rolex/rolex-01.jpg » tel quel,
 * ou « rolex-01.jpg » rangé dans le dossier de sa marque.
 * @param {Entree} e
 */
export function cheminImage(e) {
  if (!e.fichier) return null;
  const f = e.fichier.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/^images\//, "");
  if (f.includes("/")) return f;
  return e.marque ? `${slugify(e.marque)}/${f}` : f;
}

/** @param {Entree} e */
function nomMontre(e) {
  return [e.marque, e.modele].filter(Boolean).join(" ") || "Montre";
}

/** @param {Entree} e */
function texteAlt(e) {
  if (e.alt) return e.alt;
  // Construit uniquement à partir des champs renseignés.
  return [`Montre ${nomMontre(e)}`, e.reference ? `référence ${e.reference}` : null].filter(Boolean).join(", ");
}

/**
 * Applique les règles du brief et range les montres par marque, 5 emplacements chacune.
 * @param {Entree[]} entrees
 * @param {(cheminRelatif: string) => boolean} fichierExiste
 * @returns {{ sections: SectionMarque[]; problemes: Probleme[] }}
 */
export function analyser(entrees, fichierExiste) {
  /** @type {Probleme[]} */
  const problemes = [];
  const erreur = (/** @type {string} */ message) => problemes.push({ niveau: "erreur", message });
  const avert = (/** @type {string} */ message) => problemes.push({ niveau: "avertissement", message });

  /** @type {Map<string, Entree[]>} */
  const parMarque = new Map(MARQUES.map((m) => [m.slug, []]));
  entrees.forEach((e, i) => {
    const slug = e.marque ? slugify(e.marque) : null;
    const liste = slug ? parMarque.get(slug) : undefined;
    if (!liste) {
      erreur(`Entrée n°${i + 1} : marque ${e.marque ? `« ${e.marque} » hors des 5 marques prévues` : "absente"}, ignorée.`);
      return;
    }
    liste.push(e);
  });

  const sections = MARQUES.map((marque) => {
    const liste = /** @type {Entree[]} */ (parMarque.get(marque.slug));
    if (liste.length > PAR_MARQUE) {
      erreur(`${marque.nom} : ${liste.length} montres dans le JSON, seules les ${PAR_MARQUE} premières sont affichées.`);
    }

    /** @type {Emplacement[]} */
    const emplacements = liste.slice(0, PAR_MARQUE).map((e) => {
      const nom = `${nomMontre(e)}${e.fichier ? ` (${e.fichier})` : ""}`;
      const chemin = cheminImage(e);
      const licence = e.licence ? infoLicence(e.licence) : null;
      /** @type {string | null} */
      let manque = null;

      if (!chemin) {
        manque = "fichier non renseigné";
      } else if (!fichierExiste(chemin)) {
        manque = `fichier introuvable : images/${chemin}`;
      } else if (!licence) {
        manque = "licence non renseignée, photo non intégrée";
      } else if (licence.attribution && !e.auteur) {
        manque = `auteur manquant alors que la licence ${licence.nom} impose de le citer, photo non intégrée`;
      }
      if (manque) erreur(`${nom} : ${manque}.`);
      if (!manque && licence?.attribution && !e.sourceUrl) avert(`${nom} : source_url manquante dans le crédit.`);
      if (!manque && licence?.attribution && !licence.url) {
        avert(`${nom} : licence « ${licence.nom} » sans version reconnue, pas de lien vers son texte.`);
      }
      if (!e.alt) avert(`${nom} : alt vide, texte construit à partir de la marque, du modèle et de la référence.`);

      return {
        entree: e,
        image: manque || !chemin ? null : `/galerie/images/${chemin.split("/").map(encodeURIComponent).join("/")}`,
        alt: texteAlt(e),
        licence,
        manque,
      };
    });

    const vides = PAR_MARQUE - emplacements.length;
    if (vides > 0) {
      erreur(`${marque.nom} : ${vides} montre${vides > 1 ? "s" : ""} absente${vides > 1 ? "s" : ""} du JSON.`);
      for (let i = 0; i < vides; i++) {
        emplacements.push({ entree: null, image: null, alt: "", licence: null, manque: "montre absente du JSON" });
      }
    }
    return { marque, emplacements };
  });

  return { sections, problemes };
}
