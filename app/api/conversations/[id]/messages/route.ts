import { getCurrentUser } from "@/lib/auth";
import { getConversation, getMessages } from "@/lib/messages";

export async function GET(request: Request, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non connecté" }, { status: 401 });
  const { id } = await ctx.params;
  const conversation = getConversation(Number(id), user.id);
  if (!conversation) return Response.json({ error: "Introuvable" }, { status: 404 });
  const after = Number(new URL(request.url).searchParams.get("after") ?? 0) || 0;
  return Response.json({ messages: getMessages(conversation.id, user.id, after) });
}
