"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage } from "@/app/actions/conversations";
import { formatTime, parseDbDate } from "@/lib/format";
import type { Message } from "@/lib/messages";
import { SendIcon } from "./icons";

const POLL_MS = 3000;

function dayLabel(value: string) {
  const d = parseDbDate(value);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Aujourd'hui";
  if (same(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
}

export function ChatThread({
  conversationId,
  userId,
  initialMessages,
  suggestions,
}: {
  conversationId: number;
  userId: number;
  initialMessages: Message[];
  suggestions: string[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id ?? 0;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Récupère les nouveaux messages de l'interlocuteur.
  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages?after=${lastId}`, { cache: "no-store" });
        if (!res.ok || stopped) return;
        const data = (await res.json()) as { messages: Message[] };
        if (data.messages.length) {
          setMessages((prev) => {
            const known = new Set(prev.map((m) => m.id));
            return [...prev, ...data.messages.filter((m) => !known.has(m.id))];
          });
        }
      } catch {
        // Réseau indisponible : on réessaie au prochain tour.
      }
    };
    const timer = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [conversationId, lastId]);

  function send(text: string) {
    const body = text.trim();
    if (!body) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(conversationId, body);
      if (!result.ok) {
        setError(result.error ?? "Envoi impossible.");
        return;
      }
      setDraft("");
      const res = await fetch(`/api/conversations/${conversationId}/messages?after=${lastId}`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { messages: Message[] };
        setMessages((prev) => {
          const known = new Set(prev.map((m) => m.id));
          return [...prev, ...data.messages.filter((m) => !known.has(m.id))];
        });
      }
      router.refresh();
    });
  }

  let previousDay = "";

  return (
    <>
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-2">
        {messages.length === 0 && (
          <div className="my-6 text-center">
            <p className="text-sm text-muted">Commencez la conversation. Quelques idées :</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-line-strong px-3.5 py-2 text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const day = mounted ? dayLabel(m.created_at) : "";
          const showDay = day !== previousDay;
          previousDay = day;
          return (
            <div key={m.id} className="flex flex-col">
              {showDay && day && <p className="my-3 text-center text-xs font-medium uppercase tracking-wider text-faint">{day}</p>}
              <div
                className={`max-w-[80%] rounded-[1.25rem] px-4 py-2.5 text-[15px] leading-snug ${
                  mine ? "self-end rounded-br-md bg-accent text-white" : "self-start rounded-bl-md border border-line bg-surface-2"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-right text-[11px] ${mine ? "text-white/70" : "text-faint"}`}>
                  {formatTime(m.created_at)}
                  {mine && (m.read_at ? " · Lu" : "")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="sticky bottom-0 border-t border-line bg-ink/85 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-xl"
      >
        {error && <p className="mb-2 text-sm text-danger">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Votre message…"
            aria-label="Votre message"
            className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-line bg-surface px-4 py-3 text-[15px] outline-none placeholder:text-faint focus:border-accent/60"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            aria-label="Envoyer"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-white transition disabled:opacity-40"
          >
            <SendIcon size={20} />
          </button>
        </div>
      </form>
    </>
  );
}
