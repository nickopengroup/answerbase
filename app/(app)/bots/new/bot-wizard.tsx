"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCw,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChatPanel } from "@/components/app/chat-panel";
import { EmbedSnippet } from "@/components/app/embed-snippet";
import { createDraftBot, updateBot } from "@/app/(app)/dashboard/actions";

const DEFAULT_WELCOME = "Hi! Ask me anything about our services.";
const PRESETS = ["#047857", "#1D4ED8", "#0F766E", "#B45309", "#BE123C", "#334155"];

interface DocItem {
  id: string;
  filename: string;
  status: "parsing" | "indexing" | "ready" | "error";
  error_message: string | null;
}

function prettyName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 60);
}

export function BotWizard({ appUrl }: { appUrl: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const botId = useRef<string | null>(null);
  const token = useRef<string>("");
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("Untitled bot");
  const [welcome, setWelcome] = useState(DEFAULT_WELCOME);
  const [color, setColor] = useState("#047857");
  const welcomeEdited = useRef(false);
  const nameEdited = useRef(false);

  const [questions, setQuestions] = useState<string[]>([]);
  const generatedRef = useRef(false);

  const pending = docs.some(
    (d) => d.status === "parsing" || d.status === "indexing",
  );
  const hasReady = docs.some((d) => d.status === "ready");

  const ensureBot = useCallback(async (): Promise<string | null> => {
    if (botId.current) return botId.current;
    const res = await createDraftBot();
    if (res.error || !res.botId) {
      toast.error(res.error ?? "We couldn't start a new bot.");
      return null;
    }
    botId.current = res.botId;
    token.current = res.token ?? "";
    return res.botId;
  }, []);

  const refresh = useCallback(async () => {
    if (!botId.current) return;
    const res = await fetch(`/api/documents?botId=${botId.current}`);
    if (!res.ok) return;
    const json = (await res.json()) as { documents: DocItem[] };
    setDocs(json.documents);
  }, []);

  // Poll while anything is processing.
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(refresh, 1500);
    return () => clearInterval(t);
  }, [pending, refresh]);

  // Generate welcome + suggested questions once documents settle.
  useEffect(() => {
    if (pending || !hasReady || generatedRef.current || !botId.current) return;
    generatedRef.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/bots/${botId.current}/generate-intro`, {
          method: "POST",
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          questions: string[];
          welcome: string;
        };
        setQuestions(json.questions ?? []);
        if (!welcomeEdited.current && json.welcome) setWelcome(json.welcome);
      } catch {
        // graceful — no chips
      }
    })();
  }, [pending, hasReady]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const id = await ensureBot();
    if (!id) return;
    setUploading(true);
    generatedRef.current = false; // new content -> regenerate when it settles
    try {
      for (const file of Array.from(files)) {
        if (!nameEdited.current && name === "Untitled bot") {
          setName(prettyName(file.name));
        }
        const body = new FormData();
        body.append("file", file);
        body.append("botId", id);
        const res = await fetch("/api/documents", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Upload failed.");
          continue;
        }
        void fetch(`/api/documents/${json.id}/process`, { method: "POST" });
      }
      await refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function retry(id: string) {
    generatedRef.current = false;
    setDocs((ds) =>
      ds.map((d) =>
        d.id === id ? { ...d, status: "parsing", error_message: null } : d,
      ),
    );
    await fetch(`/api/documents/${id}/process`, { method: "POST" });
    await refresh();
  }

  async function saveBasics(): Promise<boolean> {
    const id = await ensureBot();
    if (!id) return false;
    const fd = new FormData();
    fd.append("name", name);
    fd.append("welcome_message", welcome);
    fd.append("accent_color", color);
    const res = await updateBot(id, {}, fd);
    if (res.error) {
      toast.error(res.error);
      return false;
    }
    return true;
  }

  function dismiss() {
    router.push(botId.current ? `/bots/${botId.current}` : "/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <div className="flex items-center justify-between">
        <Steps step={step} />
        <button
          onClick={dismiss}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-8">
        {step === 1 ? (
          <StepUpload
            docs={docs}
            uploading={uploading}
            inputRef={inputRef}
            onFiles={handleFiles}
            onRetry={retry}
            onContinue={async () => {
              await ensureBot();
              setStep(2);
            }}
            onSkip={async () => {
              await ensureBot();
              setStep(2);
            }}
          />
        ) : null}

        {step === 2 ? (
          <StepBasics
            name={name}
            welcome={welcome}
            color={color}
            setName={(v) => {
              nameEdited.current = true;
              setName(v);
            }}
            setWelcome={(v) => {
              welcomeEdited.current = true;
              setWelcome(v);
            }}
            setColor={setColor}
            onBack={() => setStep(1)}
            onContinue={async () => {
              if (await saveBasics()) setStep(3);
            }}
          />
        ) : null}

        {step === 3 ? (
          <StepTry
            botId={botId.current!}
            token={token.current}
            appUrl={appUrl}
            welcome={welcome}
            questions={questions}
            pending={pending}
            hasReady={hasReady}
          />
        ) : null}
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Upload", "Make it yours", "Try it"];
  return (
    <div className="flex items-center gap-2 text-sm">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                active
                  ? "bg-brand text-white"
                  : done
                    ? "bg-brand-soft text-brand-hover"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {n}
            </span>
            <span className={active ? "text-ink" : "text-muted-foreground"}>
              {label}
            </span>
            {n < 3 ? <span className="text-border">—</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function StepUpload({
  docs,
  uploading,
  inputRef,
  onFiles,
  onRetry,
  onContinue,
  onSkip,
}: {
  docs: DocItem[];
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (f: FileList | null) => void;
  onRetry: (id: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <div>
      <h1 className="text-2xl text-ink">Add your documents</h1>
      <p className="mt-1 text-muted-foreground">
        Your bot answers from these. Upload your FAQs, pricing, or guides — PDF,
        Markdown, or text.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.md,.markdown,.txt"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-6 flex w-full flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-brand bg-brand-soft" : "border-border hover:bg-surface",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-brand" />
        ) : (
          <Upload className="size-6 stroke-[1.5] text-muted-foreground" />
        )}
        <span className="mt-3 text-sm font-medium text-ink">
          Drag &amp; drop or click to upload
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          Up to 10 MB each
        </span>
      </button>

      {docs.length > 0 ? (
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <FileText className="size-[18px] shrink-0 stroke-[1.5] text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {d.filename}
                </p>
                {d.status === "error" && d.error_message ? (
                  <p className="text-xs leading-snug text-danger">
                    {d.error_message}
                  </p>
                ) : null}
              </div>
              <DocBadge status={d.status} />
              {d.status === "error" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Retry"
                  onClick={() => onRetry(d.id)}
                >
                  <RotateCw className="size-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
        >
          Skip for now
        </button>
        <Button onClick={onContinue} disabled={docs.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}

function StepBasics({
  name,
  welcome,
  color,
  setName,
  setWelcome,
  setColor,
  onBack,
  onContinue,
}: {
  name: string;
  welcome: string;
  color: string;
  setName: (v: string) => void;
  setWelcome: (v: string) => void;
  setColor: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div>
      <h1 className="text-2xl text-ink">Make it yours</h1>
      <p className="mt-1 text-muted-foreground">
        We&apos;ve filled these in from your documents. Tweak anything or just
        continue.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wiz-name">Bot name</Label>
          <Input
            id="wiz-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wiz-welcome">Welcome message</Label>
          <Textarea
            id="wiz-welcome"
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            rows={3}
            maxLength={300}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Accent color</Label>
          <div className="flex items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`Use ${p}`}
                onClick={() => setColor(p)}
                className={cn(
                  "size-7 rounded-full border transition-transform",
                  color.toLowerCase() === p.toLowerCase()
                    ? "border-ink ring-2 ring-offset-2 ring-offset-background"
                    : "border-border hover:scale-105",
                )}
                style={{ backgroundColor: p }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Custom accent color"
              className="ml-1 size-7 cursor-pointer rounded-md border border-border bg-transparent p-0"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          onClick={async () => {
            setSaving(true);
            await onContinue();
            setSaving(false);
          }}
          disabled={saving}
        >
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

function StepTry({
  botId,
  token,
  appUrl,
  welcome,
  questions,
  pending,
  hasReady,
}: {
  botId: string;
  token: string;
  appUrl: string;
  welcome: string;
  questions: string[];
  pending: boolean;
  hasReady: boolean;
}) {
  return (
    <div>
      <h1 className="text-2xl text-ink">Try your bot</h1>
      <p className="mt-1 text-muted-foreground">
        Ask a question — or tap a suggestion to see it answer from your
        documents.
      </p>

      {pending && !hasReady ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Your documents are still indexing — the chat will be ready in a
          moment.
        </p>
      ) : null}

      <div className="mt-6 rounded-xl border border-border p-4">
        <ChatPanel
          key={questions.join("|")}
          botId={botId}
          welcomeMessage={welcome}
          suggestedQuestions={questions}
        />
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-ink">Add it to your website</p>
        <div className="mt-3">
          <EmbedSnippet appUrl={appUrl} token={token} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button render={<Link href={`/bots/${botId}`} />}>Go to bot page</Button>
      </div>
    </div>
  );
}

function DocBadge({ status }: { status: DocItem["status"] }) {
  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-hover">
        <CheckCircle2 className="size-3.5" />
        Ready
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
        <AlertCircle className="size-3.5" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {status === "parsing" ? "Parsing" : "Indexing"}
    </span>
  );
}
