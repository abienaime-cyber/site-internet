import { getDb } from "@/lib/db";

export async function GET(_request: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const { id } = await ctx.params;
  const photo = getDb().prepare("SELECT mime, data FROM listing_photos WHERE id = ?").get(Number(id)) as
    | { mime: string; data: Uint8Array }
    | undefined;
  if (!photo) return new Response("Introuvable", { status: 404 });
  return new Response(Buffer.from(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
