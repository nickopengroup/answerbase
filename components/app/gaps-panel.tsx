"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { answerGap, dismissGap } from "@/app/(app)/bots/[id]/gap-actions";

export interface Gap {
  id: string;
  question: string;
  channel: "app" | "widget" | null;
  createdAt: string;
}

export function GapsPanel({ initialGaps }: { initialGaps: Gap[] }) {
  const [gaps, setGaps] = useState<Gap[]>(initialGaps);

  function resolve(id: string) {
    setGaps((g) => g.filter((x) => x.id !== id));
  }

  if (gaps.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <MessageSquare className="size-6 stroke-[1.5] text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-ink">
          Your bot is keeping up
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          When someone asks something your documents don&apos;t cover,
          it&apos;ll show up here so you can answer it.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {gaps.map((gap) => (
        <GapRow key={gap.id} gap={gap} onResolved={() => resolve(gap.id)} />
      ))}
    </ul>
  );
}

function GapRow({ gap, onResolved }: { gap: Gap; onResolved: () => void }) {
  const [answering, setAnswering] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!text.trim() || pending) return;
    setPending(true);
    const res = await answerGap(gap.id, text);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Added to your bot's knowledge.");
    onResolved();
  }

  async function dismiss() {
    setPending(true);
    await dismissGap(gap.id);
    onResolved();
  }

  return (
    <li className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-ink">{gap.question}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {gap.channel === "widget" ? "From the widget" : "From the in-app chat"} ·{" "}
        {timeAgo(gap.createdAt)}
      </p>

      {answering ? (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Write the answer your bot should give…"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={pending || !text.trim()}>
              {pending ? "Saving…" : "Save answer"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAnswering(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => setAnswering(true)}>
            Answer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={dismiss}
            disabled={pending}
          >
            Dismiss
          </Button>
        </div>
      )}
    </li>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
