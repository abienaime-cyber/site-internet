"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, safeNext } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type AuthState = { error?: string; fields?: Record<string, string> } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const city = String(formData.get("city") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fields = { name, email, city };

  if (name.length < 2 || name.length > 60) return { error: "Indiquez votre prénom et votre nom.", fields };
  if (!EMAIL_RE.test(email)) return { error: "Cette adresse e-mail n'est pas valide.", fields };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères.", fields };

  const db = getDb();
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    return { error: "Un compte existe déjà avec cette adresse.", fields };
  }
  const hue = Math.floor(Math.random() * 360);
  const result = db
    .prepare("INSERT INTO users (email, name, password_hash, city, avatar_hue) VALUES (?, ?, ?, ?, ?)")
    .run(email, name, hashPassword(password), city.slice(0, 60), hue);
  await createSession(Number(result.lastInsertRowid));
  redirect(safeNext(formData.get("next")));
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = getDb().prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as
    | { id: number; password_hash: string }
    | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "E-mail ou mot de passe incorrect.", fields: { email } };
  }
  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
