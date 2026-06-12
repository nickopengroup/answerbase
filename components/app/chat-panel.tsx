"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_HINT = "knowledge base yet";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  pending?: boolean;
}

interface ChatMeta {
  conversationId: string;
  sources: string[];
  refused: boolean;
}

export function ChatPanel({
  botId,
  welcomeMessage,
  suggestedQuestions = [],
}: {
  botId: string;
  welcomeMessage: string;
  suggestedQuestions?: string[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const conversationId = useRef<string | null>(null);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showChips =
    suggestedQuestions.length > 0 && !messages.some((m) => m.role === "user");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(textArg?: string) {
    const question = (textArg ?? input).trim();
    if (!question || sending) return;
    setInput("");
    setSending(true);

    const userId = nextId.current++;
    const botMsgId = nextId.current++;
    setMessages((m) => [
      ...m,
      { id: userId, role: "user", content: question },
      { id: botMsgId, role: "assistant", content: "", pending: true },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          conversationId: conversationId.current,
          question,
        }),
      });

      if (!res.ok || !res.body) {
        const msg = await res
          .json()
          .then((j) => j.error)
          .catch(() => null);
        throw new Error(msg ?? "Something went wrong. Please try again.");
      }

      const metaRaw = res.headers.get("x-chat-meta");
      const meta: ChatMeta | null = metaRaw
        ? JSON.parse(decodeURIComponent(metaRaw))
        : null;
      if (meta?.conversationId) conversationId.current = meta.conversationId;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg) =>
            msg.id === botMsgId ? { ...msg, content: acc, pending: false } : msg,
          ),
        );
      }

      const refused = !acc.trim() || acc.toLowerCase().includes(FALLBACK_HINT);
      const sources = refused ? [] : (meta?.sources ?? []);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === botMsgId
            ? { ...msg, content: acc, pending: false, sources }
            : msg,
        ),
      );
    } catch (err) {
      setMessages((m) => m.filter((msg) => msg.id !== botMsgId));
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[28rem] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1.5",
              msg.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3.5 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-brand-soft text-ink"
                  : "border border-border bg-background text-ink",
              )}
            >
              {msg.pending ? (
                <TypingDots />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>

            {msg.sources && msg.sources.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {msg.sources.map((name) => (
                  <span
                    key={name}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {name.replace(/\.[^.]+$/, "")}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {showChips ? (
        <div className="flex flex-wrap gap-2 pt-3">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={sending}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink/20 hover:bg-muted disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex items-end gap-2 border-t border-border pt-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Ask your bot a question…"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
