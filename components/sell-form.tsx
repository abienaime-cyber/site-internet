"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createListing, type ListingFormState } from "@/app/actions/listings";
import { BRANDS, CONDITIONS, MAX_PHOTOS } from "@/lib/constants";
import { BoxIcon, CameraIcon, CloseIcon, DocIcon } from "./icons";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[15px] outline-none placeholder:text-faint focus:border-accent/60";

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-line bg-surface p-4 md:p-5">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-text text-sm text-ink">{step}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function SellForm({ defaultCity }: { defaultCity: string }) {
  const [state, action, pending] = useActionState<ListingFormState, FormData>(createListing, undefined);
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    // Copie avant de vider l'input : la FileList est vidée en même temps.
    const room = MAX_PHOTOS - photos.length;
    const added = Array.from(list)
      .slice(0, Math.max(room, 0))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photos[index].url);
    setPhotos((prev) => prev.filter((_, j) => j !== index));
  }

  function submit(formData: FormData) {
    formData.delete("photos");
    photos.forEach((p) => formData.append("photos", p.file));
    return action(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-4">
      <Section step={1} title="Photos">
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {photos.map(({ url: src }, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute bottom-1 left-1 rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold">Couverture</span>}
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Retirer la photo ${i + 1}`}
                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80"
              >
                <CloseIcon size={13} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-strong text-muted transition hover:border-accent hover:text-text"
            >
              <CameraIcon size={22} />
              <span className="text-xs">Ajouter</span>
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
          aria-label="Ajouter des photos"
        />
        <p className="text-xs text-faint">
          Jusqu&apos;à {MAX_PHOTOS} photos (JPEG, PNG, WebP, 4 Mo max). Montrez le cadran, le dos, le fermoir, la boîte et les papiers.
        </p>
      </Section>

      <Section step={2} title="La montre">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marque">
            <select name="brand" required defaultValue="" className={field}>
              <option value="" disabled>
                Choisir
              </option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Modèle">
            <input name="model" required placeholder="Submariner Date" className={field} />
          </Field>
          <Field label="Référence" hint="Gravée entre les cornes ou sur les papiers">
            <input name="reference" placeholder="126610LN" className={field} />
          </Field>
          <Field label="Année d'achat ou de production">
            <input name="year" type="number" inputMode="numeric" min={1900} max={2100} placeholder="2021" className={field} />
          </Field>
          <Field label="Diamètre (mm)">
            <input name="caseSize" type="number" inputMode="numeric" min={20} max={60} placeholder="41" className={field} />
          </Field>
          <Field label="Matière">
            <input name="material" placeholder="Acier, or, titane…" className={field} />
          </Field>
          <Field label="Mouvement">
            <select name="movement" defaultValue="Automatique" className={field}>
              {["Automatique", "Remontage manuel", "Chronographe automatique", "Quartz", "Spring Drive"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Couleur du cadran">
            <div className="flex h-12 items-center gap-2">
              {["#111317", "#23406f", "#e9e8e3", "#1f4d3a", "#6b6f76", "#7a1f2b"].map((c, i) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="dial" value={c} defaultChecked={i === 0} className="peer sr-only" />
                  <span className="block h-8 w-8 rounded-full border-2 border-transparent ring-1 ring-black/15 peer-checked:border-text" style={{ background: c }} />
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      <Section step={3} title="État et accessoires">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONDITIONS.map((c, i) => (
            <label key={c.value} className="cursor-pointer">
              <input type="radio" name="condition" value={c.value} required defaultChecked={i === 1} className="peer sr-only" />
              <span className="block rounded-xl border border-line px-3 py-3 text-center text-sm text-muted transition peer-checked:border-text peer-checked:bg-text peer-checked:font-semibold peer-checked:text-ink">
                {c.label}
              </span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "hasBox", label: "Boîte d'origine", icon: BoxIcon },
            { name: "hasPapers", label: "Papiers / garantie", icon: DocIcon },
          ].map(({ name, label, icon: Icon }) => (
            <label key={name} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 has-[:checked]:border-success/60">
              <Icon size={18} className="text-muted" />
              <span className="flex-1 text-sm">{label}</span>
              <input type="checkbox" name={name} className="h-5 w-5 accent-[var(--color-success)]" />
            </label>
          ))}
        </div>
        <Field label="Description">
          <textarea
            name="description"
            required
            minLength={20}
            rows={5}
            placeholder="Historique, révisions, rayures éventuelles, taille de poignet du bracelet…"
            className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[15px] outline-none placeholder:text-faint focus:border-accent/60"
          />
        </Field>
      </Section>

      <Section step={4} title="Prix et lieu">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prix de vente (€)">
            <input name="price" required inputMode="decimal" placeholder="9 500" className={`${field} text-lg font-semibold`} />
          </Field>
          <Field label="Ville">
            <input name="city" defaultValue={defaultCity} placeholder="Paris" className={field} />
          </Field>
        </div>
      </Section>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="h-14 rounded-2xl bg-accent text-[15px] font-semibold text-white transition disabled:opacity-60">
        {pending ? "Publication…" : "Publier l'annonce"}
      </button>
    </form>
  );
}
