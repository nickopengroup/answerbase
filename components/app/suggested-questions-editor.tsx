"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSuggestedQuestions } from "@/app/(app)/dashboard/actions";

const MAX = 6;

export function SuggestedQuestionsEditor({
  botId,
  initial,
}: {
  botId: string;
  initial: string[];
}) {
  const [questions, setQuestions] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  function setAt(i: number, value: string) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? value : q)));
  }
  function removeAt(i: number) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }
  function add() {
    if (questions.length >= MAX) return;
    setQuestions((qs) => [...qs, ""]);
  }

  async function save() {
    setSaving(true);
    const res = await updateSuggestedQuestions(
      botId,
      questions.map((q) => q.trim()).filter(Boolean),
    );
    setSaving(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    setQuestions((qs) => qs.map((q) => q.trim()).filter(Boolean));
    toast.success("Suggested questions saved.");
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/bots/${botId}/generate-intro`, {
        method: "POST",
      });
      const json = (await res.json()) as { questions?: string[] };
      if (!res.ok || !json.questions) {
        toast.error("We couldn't regenerate questions. Please try again.");
        return;
      }
      setQuestions(json.questions);
      toast.success("Regenerated from your documents.");
    } catch {
      toast.error("We couldn't regenerate questions. Please try again.");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        These appear as one-click chips when a chat is empty — in the test chat
        and the widget. Edit, remove, or add your own (up to {MAX}).
      </p>

      {questions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No suggested questions yet. Add one, or regenerate from your
          documents.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-center gap-2">
              <Input
                value={q}
                maxLength={140}
                placeholder="e.g. How much does the basic plan cost?"
                onChange={(e) => setAt(i, e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove question"
                onClick={() => removeAt(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={add}
          disabled={questions.length >= MAX}
        >
          <Plus className="size-4" />
          Add a question
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerate}
            disabled={regenerating || saving}
          >
            {regenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Regenerate
          </Button>
          <Button size="sm" onClick={save} disabled={saving || regenerating}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
