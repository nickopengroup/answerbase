import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processDocument } from "@/lib/documents";

export const runtime = "nodejs";
export const maxDuration = 60;

// Process (or retry) a document: parse → chunk → embed → ready.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid document." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  // RLS makes the row visible only to its owner.
  const { data: doc } = await supabase
    .from("documents")
    .select("id")
    .eq("id", id)
    .single();
  if (!doc) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 },
    );
  }

  const result = await processDocument(supabase, createAdminClient(), id);
  return NextResponse.json(result);
}
