"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RotateCw,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentRow } from "@/lib/types";

type DocItem = Pick<
  DocumentRow,
  "id" | "filename" | "kind" | "status" | "error_message" | "page_count"
>;

const ACCEPT = ".pdf,.md,.markdown,.txt";

export function DocumentsPanel({
  botId,
  initialDocuments,
}: {
  botId: string;
  initialDocuments: DocItem[];
}) {
  const [documents, setDocuments] = useState<DocItem[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/documents?botId=${botId}`);
    if (!res.ok) return;
    const json = (await res.json()) as { documents: DocItem[] };
    setDocuments(json.documents);
  }, [botId]);

  const pending = documents.some(
    (d) => d.status === "parsing" || d.status === "indexing",
  );

  // Poll while anything is still processing.
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(refresh, 1500);
    return () => clearInterval(timer);
  }, [pending, refresh]);

  // Regenerate the welcome + suggested questions once processing settles.
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && documents.some((d) => d.status === "ready")) {
      void fetch(`/api/bots/${botId}/generate-intro`, { method: "POST" });
    }
    wasPending.current = pending;
  }, [pending, documents, botId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        body.append("botId", botId);
        const res = await fetch("/api/documents", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Upload failed.");
          continue;
        }
        // Kick off processing; polling reflects the status.
        void fetch(`/api/documents/${json.id}/process`, { method: "POST" });
      }
      await refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function retry(id: string) {
    setDocuments((docs) =>
      docs.map((d) =>
        d.id === id ? { ...d, status: "parsing", error_message: null } : d,
      ),
    );
    await fetch(`/api/documents/${id}/process`, { method: "POST" });
    await refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDocuments((docs) => docs.filter((d) => d.id !== id));
      void fetch(`/api/bots/${botId}/generate-intro`, { method: "POST" });
    } else {
      toast.error("We couldn't delete that document.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          PDF, Markdown, or text files, up to 10 MB each.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Uploading…" : "Upload document"}
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <FileText className="size-6 stroke-[1.5] text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-ink">No documents yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Upload the documents your bot should answer from — FAQs, pricing,
            onboarding guides.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
            >
              <FileText className="size-[18px] shrink-0 stroke-[1.5] text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {doc.filename}
                </p>
                {doc.status === "error" && doc.error_message ? (
                  <p className="text-xs leading-snug text-danger">
                    {doc.error_message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {doc.status === "ready"
                      ? `${doc.page_count} ${doc.page_count === 1 ? "page" : "pages"}`
                      : doc.kind.toUpperCase()}
                  </p>
                )}
              </div>

              <StatusBadge status={doc.status} />

              {doc.status === "error" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Retry"
                  onClick={() => retry(doc.id)}
                >
                  <RotateCw className="size-4" />
                </Button>
              ) : null}

              {doc.status === "ready" || doc.status === "error" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete document"
                  onClick={() => remove(doc.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DocItem["status"] }) {
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
