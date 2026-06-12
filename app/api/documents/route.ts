import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kindFromFilename } from "@/lib/parsing";
import { checkLimit, getUsage, planLimit } from "@/lib/limits";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const uuid = z.string().uuid();

// Upload a document: validate, store the file, create the row as `parsing`.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const botId = form.get("botId");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file was uploaded." },
      { status: 400 },
    );
  }
  if (typeof botId !== "string" || !uuid.safeParse(botId).success) {
    return NextResponse.json({ error: "Invalid bot." }, { status: 400 });
  }

  const { data: bot } = await supabase
    .from("bots")
    .select("id, workspace_id, workspaces!inner(plan)")
    .eq("id", botId)
    .single();
  if (!bot) {
    return NextResponse.json({ error: "Bot not found." }, { status: 404 });
  }

  // Enforce the document-pages limit (server-side).
  const plan = (bot.workspaces as unknown as { plan: Plan }).plan;
  const usage = await getUsage(supabase, bot.workspace_id as string);
  if (!checkLimit(usage, plan, "pages").allowed) {
    return NextResponse.json(
      {
        error: `You've reached your ${planLimit(plan, "pages")}-page limit. Upgrade to Pro on the Billing page to add more documents.`,
      },
      { status: 402 },
    );
  }

  const kind = kindFromFilename(file.name);
  if (!kind) {
    const ext = file.name.includes(".")
      ? file.name.split(".").pop()!.toUpperCase()
      : "That";
    return NextResponse.json(
      {
        error: `${ext} files aren't supported yet. Please upload a PDF, Markdown, or text file.`,
      },
      { status: 415 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: "That file looks empty." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That file is over the 10 MB limit." },
      { status: 413 },
    );
  }

  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({ bot_id: botId, filename: file.name, kind, status: "parsing" })
    .select("id")
    .single();
  if (insertError || !doc) {
    return NextResponse.json(
      { error: "We couldn't start processing. Please try again." },
      { status: 500 },
    );
  }

  const admin = createAdminClient();
  // Use a safe storage key — the real filename can contain non-ASCII,
  // spaces, or brackets that Supabase Storage rejects in object keys. The
  // original name is kept in documents.filename for display.
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "bin";
  const path = `${botId}/${doc.id}/file.${ext || "bin"}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
  if (uploadError) {
    await supabase
      .from("documents")
      .update({
        status: "error",
        error_message: "Upload failed. Please try again.",
      })
      .eq("id", doc.id);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }

  await supabase
    .from("documents")
    .update({ storage_path: path })
    .eq("id", doc.id);

  return NextResponse.json({ id: doc.id });
}

// List a bot's documents (used for status polling).
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const botId = new URL(request.url).searchParams.get("botId");
  if (!botId || !uuid.safeParse(botId).success) {
    return NextResponse.json({ error: "Invalid bot." }, { status: 400 });
  }

  const { data } = await supabase
    .from("documents")
    .select(
      "id, filename, kind, status, error_message, page_count, created_at",
    )
    .eq("bot_id", botId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ documents: data ?? [] });
}
