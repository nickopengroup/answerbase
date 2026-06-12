"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";

const FALLBACK_HINT = "knowledge base yet";

interface Msg {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  pending?: boolean;
}

export function WidgetChat({
  token,
  name,
  welcomeMessage,
  accentColor,
  showPoweredBy,
  suggestedQuestions = [],
}: {
  token: string;
  name: string;
  welcomeMessage: string;
  accentColor: string;
  showPoweredBy: boolean;
  suggestedQuestions?: string[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
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

  function close() {
    window.parent.postMessage({ type: "answerbase:close" }, "*");
  }

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
      const res = await fetch(`/api/widget/${token}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId.current,
          question,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error("err");
      }

      const metaRaw = res.headers.get("x-chat-meta");
      const meta = metaRaw ? JSON.parse(decodeURIComponent(metaRaw)) : null;
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
      setMessages((m) =>
        m.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: acc,
                pending: false,
                sources: refused ? [] : (meta?.sources ?? []),
              }
            : msg,
        ),
      );
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                pending: false,
                content:
                  "Something went wrong on our end. Please try again in a moment.",
              }
            : msg,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: accentColor }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-white/80">Ask us anything</p>
        </div>
        <button
          onClick={close}
          aria-label="Close chat"
          className="flex size-7 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/15"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === "user"
                ? "flex flex-col items-end gap-1"
                : "flex flex-col items-start gap-1"
            }
          >
            <div
              className={
                msg.role === "user"
                  ? "max-w-[85%] rounded-xl px-3 py-2 text-[15px] leading-relaxed"
                  : "max-w-[85%] rounded-xl border border-border bg-background px-3 py-2 text-[15px] leading-relaxed text-ink"
              }
              style={
                msg.role === "user"
                  ? { backgroundColor: `${accentColor}1A`, color: "#18181b" }
                  : undefined
              }
            >
              {msg.pending ? (
                <TypingDots />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
            {msg.sources && msg.sources.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pl-1">
                {msg.sources.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {s.replace(/\.[^.]+$/, "")}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {showChips ? (
          <div className="flex flex-col items-start gap-2 pt-1">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={sending}
                className="rounded-full border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-50"
                style={{ borderColor: `${accentColor}40`, color: "#18181b" }}
              >
                {q}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-border p-3"
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
          placeholder="Type your question…"
          className="max-h-28 min-h-9 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: accentColor }}
        >
          <ArrowUp className="size-4" />
        </button>
      </form>

      {showPoweredBy ? (
        <a
          href="https://answerbase-rho.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="border-t border-border py-1.5 text-center text-[11px] text-muted-foreground hover:text-ink"
        >
          Powered by Answerbase
        </a>
      ) : null}
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
