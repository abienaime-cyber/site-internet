"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BRANDS, CONDITIONS, MAX_PHOTO_BYTES, MAX_PHOTOS, MAX_PRICE_EUR } from "@/lib/constants";
import { transaction, getDb } from "@/lib/db";
import type { WatchVisual } from "@/lib/visual";

export type ListingFormState = { error?: string } | undefined;

const MIME = ["image/jpeg", "image/png", "image/webp"];
const DIALS = ["#111317", "#23406f", "#e9e8e3", "#1f4d3a", "#6b6f76", "#7a1f2b"];

export async function createListing(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?next=/vendre");

  const text = (key: string, max = 120) => String(formData.get(key) ?? "").trim().slice(0, max);
  const brand = text("brand");
  const model = text("model");
  const reference = text("reference", 40);
  const condition = text("condition");
  const description = text("description", 3000);
  const material = text("material", 60);
  const movement = text("movement", 60);
  const city = text("city", 60) || user.city;
  const year = Number.parseInt(text("year"), 10);
  const caseSize = Number.parseInt(text("caseSize"), 10);
  const price = Number(text("price").replace(/\s/g, "").replace(",", "."));
  const dial = text("dial");

  if (!BRANDS.includes(brand as (typeof BRANDS)[number])) return { error: "Choisissez une marque." };
  if (model.length < 2) return { error: "Indiquez le modèle de la montre." };
  if (!CONDITIONS.some((c) => c.value === condition)) return { error: "Précisez l'état de la montre." };
  if (!Number.isFinite(price) || price < 100 || price > MAX_PRICE_EUR) {
    return { error: `Le prix doit être compris entre 100 € et ${MAX_PRICE_EUR.toLocaleString("fr-FR")} €.` };
  }
  const currentYear = new Date().getFullYear();
  if (text("year") && !(year >= 1900 && year <= currentYear)) return { error: `L'année doit être comprise entre 1900 et ${currentYear}.` };
  if (description.length < 20) return { error: "Décrivez la montre en quelques phrases (20 caractères minimum)." };

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length === 0) return { error: "Ajoutez au moins une photo de la montre." };
  if (photos.length > MAX_PHOTOS) return { error: `${MAX_PHOTOS} photos maximum.` };
  for (const photo of photos) {
    if (!MIME.includes(photo.type)) return { error: "Formats acceptés : JPEG, PNG ou WebP." };
    if (photo.size > MAX_PHOTO_BYTES) return { error: "Chaque photo doit peser moins de 4 Mo." };
  }
  const buffers = await Promise.all(photos.map(async (p) => ({ mime: p.type, data: new Uint8Array(await p.arrayBuffer()) })));

  const visual: WatchVisual = {
    shape: "round",
    metal: "steel",
    dial: DIALS.includes(dial) ? dial : DIALS[0],
    bezel: "smooth",
    strap: "bracelet",
    date: true,
  };

  const db = getDb();
  const id = transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO listings (seller_id, brand, model, reference, year, condition, has_box, has_papers, price,
          description, case_size, material, movement, city, visual)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        user.id, brand, model, reference, Number.isFinite(year) ? year : null, condition,
        formData.get("hasBox") ? 1 : 0, formData.get("hasPapers") ? 1 : 0, Math.round(price * 100),
        description, Number.isFinite(caseSize) && caseSize > 15 && caseSize < 70 ? caseSize : null,
        material, movement, city, JSON.stringify(visual),
      );
    const listingId = Number(result.lastInsertRowid);
    const insertPhoto = db.prepare("INSERT INTO listing_photos (listing_id, position, mime, data) VALUES (?, ?, ?, ?)");
    buffers.forEach((b, i) => insertPhoto.run(listingId, i, b.mime, b.data));
    return listingId;
  });

  redirect(`/annonces/${id}`);
}
