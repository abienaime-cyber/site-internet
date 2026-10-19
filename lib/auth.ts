import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import { getDb } from "./db";

const COOKIE_NAME = "remontoir_session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  city: string;
  bio: string;
  avatar_hue: number;
  created_at: string;
};

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_DAYS * 86_400_000;
  getDb().prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expiresAt);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  store.delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.city, u.bio, u.avatar_hue, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
    )
    .get(token) as (CurrentUser & { expires_at: number }) | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  const { expires_at: _expires, ...user } = row;
  void _expires;
  return { ...user };
});

export async function requireUser(next: string = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  return user;
}

// Évite les redirections ouvertes vers un autre domaine après connexion.
export function safeNext(value: FormDataEntryValue | string | null | undefined): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
