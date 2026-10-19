import type { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { hashPassword } from "./password";
import type { WatchVisual } from "./visual";

type SeedUser = { name: string; email: string; city: string; bio: string; hue: number; since: string };
type SeedListing = {
  seller: number;
  brand: string;
  model: string;
  reference: string;
  year: number | null;
  condition: "neuf" | "tres_bon" | "bon" | "correct";
  box: boolean;
  papers: boolean;
  price: number;
  size: number | null;
  material: string;
  movement: string;
  description: string;
  visual: WatchVisual;
  daysAgo: number;
  // Nom du fichier dans seed-photos/ quand il ne suit pas la référence.
  photo?: string;
};

const USERS: SeedUser[] = [
  { name: "Julien Marchand", email: "julien@remontoir.fr", city: "Paris 8e", bio: "Collectionneur depuis quinze ans. Je fais tourner ma collection, toujours avec facture et historique.", hue: 212, since: "2023-02-14" },
  { name: "Claire Dumas", email: "claire@remontoir.fr", city: "Lyon", bio: "Passionnée de montres de plongée. Remise en main propre possible sur Lyon.", hue: 18, since: "2023-06-03" },
  { name: "Antoine Rey", email: "antoine@remontoir.fr", city: "Bordeaux", bio: "Je vends quelques pièces pour financer un projet. Questions bienvenues.", hue: 150, since: "2024-01-21" },
  { name: "Sofia Benali", email: "sofia@remontoir.fr", city: "Marseille", bio: "Montres habillées et chronographes. Envoi assuré uniquement.", hue: 280, since: "2024-04-09" },
  { name: "Marc Lefèvre", email: "marc@remontoir.fr", city: "Nantes", bio: "Amateur de pièces japonaises et d'outils bien faits.", hue: 40, since: "2024-09-30" },
  { name: "Hélène Vidal", email: "helene@remontoir.fr", city: "Lille", bio: "Collection personnelle, montres portées avec soin, jamais en bord de mer.", hue: 330, since: "2025-03-12" },
];

const LISTINGS: SeedListing[] = [
  { seller: 1, brand: "Rolex", model: "GMT-Master", reference: "1675", year: null, condition: "bon", box: false, papers: false, price: 18_500, size: null, material: "Acier", movement: "Automatique", daysAgo: 2,
    description: "Lunette Pepsi bleu et rouge, bracelet Oyster. Traces d'usage normales pour une montre de cet âge. Vendue sans boîte ni papiers. Photo : Thierry Mostra-store, Wikimedia Commons, licence CC BY-SA 4.0.",
    visual: { shape: "round", metal: "steel", dial: "#101216", bezel: "gmt", bezelColor: "#1f3f8f", bezelColor2: "#a3242c", strap: "bracelet", date: true } },
  { seller: 2, brand: "Rolex", model: "Air-King Precision", reference: "14000", year: 1994, condition: "tres_bon", box: false, papers: false, price: 4_900, size: null, material: "Acier", movement: "Automatique", daysAgo: 3,
    description: "Cadran champagne, lunette lisse, bracelet Oyster. Datée vers 1994. Une Rolex simple et facile à porter tous les jours. Photo : Thierry Mostra-store, Wikimedia Commons, licence CC BY-SA 4.0.",
    visual: { shape: "round", metal: "steel", dial: "#23406f", bezel: "smooth", strap: "bracelet", date: true } },
  { seller: 3, brand: "Rolex", model: "Explorer", reference: "14270", year: 2001, condition: "tres_bon", box: true, papers: false, price: 7_900, size: null, material: "Acier", movement: "Automatique", daysAgo: 4,
    description: "Cadran noir 3-6-9, bracelet Oyster. Datée vers 2001. Fournie avec sa boîte, sans papiers. Photo : Thierry Mostra-store, Wikimedia Commons, licence CC BY-SA 4.0.",
    visual: { shape: "round", metal: "steel", dial: "#0f1013", bezel: "smooth", strap: "bracelet", date: false } },
  { seller: 4, brand: "Omega", model: "Speedmaster Professional", reference: "", year: 1978, condition: "bon", box: false, papers: false, price: 5_600, size: null, material: "Acier", movement: "Chronographe à remontage manuel", daysAgo: 2, photo: "speedmaster-861",
    description: "Calibre 861, datée vers 1978. Cadran patiné, aiguilles d'origine. Vendue seule. Photo : Thierry Mostra-store, Wikimedia Commons, licence CC BY-SA 4.0.",
    visual: { shape: "round", metal: "steel", dial: "#121316", bezel: "tachy", bezelColor: "#0c0d0f", strap: "bracelet", subdials: 3, date: false } },
  { seller: 5, brand: "Breitling", model: "Navitimer AOPA", reference: "806", year: 1960, condition: "bon", box: false, papers: false, price: 6_900, size: null, material: "Acier", movement: "Chronographe à remontage manuel", daysAgo: 2,
    description: "Navitimer AOPA de 1960, mouvement Venus. Bracelet cuir noir. Vendue seule. Photo : Thierry Mostra-store, Wikimedia Commons, licence CC BY-SA 4.0.",
    visual: { shape: "round", metal: "steel", dial: "#101114", bezel: "fluted", strap: "leather", strapColor: "#151515", subdials: 3, date: true } },
];

const REVIEWS: { seller: number; author: number; rating: number; comment: string; daysAgo: number }[] = [
  { seller: 0, author: 1, rating: 5, comment: "Montre conforme, emballage soigné, vendeur très réactif.", daysAgo: 40 },
  { seller: 0, author: 4, rating: 5, comment: "Échange clair du début à la fin. Je recommande.", daysAgo: 95 },
  { seller: 1, author: 2, rating: 5, comment: "Rien à redire, envoi assuré rapide.", daysAgo: 30 },
  { seller: 1, author: 5, rating: 4, comment: "Bonne transaction, un peu d'attente pour l'envoi.", daysAgo: 70 },
  { seller: 2, author: 0, rating: 5, comment: "Description honnête, la montre est comme sur l'annonce.", daysAgo: 22 },
  { seller: 3, author: 4, rating: 5, comment: "Vendeuse sérieuse, documents complets.", daysAgo: 15 },
  { seller: 3, author: 1, rating: 5, comment: "Parfait.", daysAgo: 120 },
  { seller: 4, author: 3, rating: 4, comment: "Montre très propre, réponses rapides aux questions.", daysAgo: 50 },
  { seller: 5, author: 0, rating: 5, comment: "Transaction impeccable, je rachèterai.", daysAgo: 18 },
  { seller: 5, author: 2, rating: 4, comment: "Bon contact, emballage solide.", daysAgo: 64 },
];

export const SEED_PASSWORD = "remontoir2026";

function daysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86_400_000);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// Photos des annonces de départ : seed-photos/<référence>.jpg, puis <référence>-2.jpg, etc.
// La référence est mise en minuscules, les caractères spéciaux deviennent des tirets.
const PHOTOS_DIR = path.join(process.cwd(), "seed-photos");
const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

function seedPhotos(reference: string): { mime: string; data: Buffer }[] {
  if (!fs.existsSync(PHOTOS_DIR)) return [];
  const slug = reference.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => MIME[path.extname(f).toLowerCase()] && new RegExp(`^${slug}(-\\d+)?\\.`, "i").test(f))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .map((f) => ({ mime: MIME[path.extname(f).toLowerCase()], data: fs.readFileSync(path.join(PHOTOS_DIR, f)) }));
}

export function seedDatabase(db: DatabaseSync) {
  db.exec("BEGIN");
  try {
    const insertUser = db.prepare(
      "INSERT INTO users (email, name, password_hash, city, bio, avatar_hue, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    const passwordHash = hashPassword(SEED_PASSWORD);
    const userIds = USERS.map(
      (u) => Number(insertUser.run(u.email, u.name, passwordHash, u.city, u.bio, u.hue, `${u.since} 10:00:00`).lastInsertRowid),
    );

    const insertListing = db.prepare(
      `INSERT INTO listings (seller_id, brand, model, reference, year, condition, has_box, has_papers, price,
        description, case_size, material, movement, city, visual, created_at, views)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insertPhoto = db.prepare("INSERT INTO listing_photos (listing_id, position, mime, data) VALUES (?, ?, ?, ?)");
    // Une montre sans photo dans seed-photos/ n'est pas publiée.
    const avecPhotos = LISTINGS.map((l) => ({ l, photos: seedPhotos(l.photo ?? l.reference) })).filter((x) => x.photos.length);
    avecPhotos.forEach(({ l, photos }, i) => {
      const { lastInsertRowid } = insertListing.run(
        userIds[l.seller], l.brand, l.model, l.reference, l.year, l.condition, l.box ? 1 : 0, l.papers ? 1 : 0,
        l.price * 100, l.description, l.size, l.material, l.movement, USERS[l.seller].city.replace(/ \d+e$/, ""),
        JSON.stringify(l.visual), daysAgo(l.daysAgo), 40 + ((i * 37) % 260),
      );
      photos.forEach((photo, position) => {
        insertPhoto.run(Number(lastInsertRowid), position, photo.mime, photo.data);
      });
    });

    const insertReview = db.prepare(
      "INSERT INTO reviews (seller_id, author_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)",
    );
    for (const r of REVIEWS) {
      insertReview.run(userIds[r.seller], userIds[r.author], r.rating, r.comment, daysAgo(r.daysAgo));
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
