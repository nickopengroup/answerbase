"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function EmbedSnippet({
  appUrl,
  token,
}: {
  appUrl: string;
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${appUrl}/embed.js" data-bot="${token}" async></script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Embed code copied.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy. Select the code and copy it manually.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-x-auto rounded-lg bg-ink p-4">
        <code className="block whitespace-pre font-mono text-xs leading-relaxed text-zinc-100">
          {snippet}
        </code>
        <button
          onClick={copy}
          aria-label="Copy embed code"
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-zinc-100 transition-colors hover:bg-white/20"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Paste this before the closing <code className="text-ink">&lt;/body&gt;</code>{" "}
        tag on your website. The widget uses your bot&apos;s accent color, set
        in Settings.
      </p>
    </div>
  );
}
