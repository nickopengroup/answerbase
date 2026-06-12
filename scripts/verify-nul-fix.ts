import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processDocument } from "../lib/documents.ts";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function main() {
  const email = `nulfix-${Date.now()}@answerbase.test`;
  const { data: u } = await admin.auth.admin.createUser({ email, password: "supersecret123", email_confirm: true });
  const userId = u!.user!.id;
  await admin.from("workspaces").insert({ owner_id: userId, name: "W", plan: "free" });
  const { data: ws } = await admin.from("workspaces").select("id").eq("owner_id", userId).single();
  const { data: bot } = await admin.from("bots").insert({ workspace_id: ws!.id, name: "N", welcome_message: "Hi", accent_color: "#047857", public_token: randomBytes(16).toString("base64url") }).select("id").single();

  // A .txt whose content contains NUL bytes (as PDF extraction can produce).
  const NUL = String.fromCharCode(0);
  const content = `The Essential plan is $399 per month.${NUL} Reports are delivered by the 20th.${NUL}`;
  const { data: doc } = await admin.from("documents").insert({ bot_id: bot!.id, filename: "n.txt", kind: "txt", status: "parsing" }).select("id").single();
  const path = `${bot!.id}/${doc!.id}/file.txt`;
  await admin.storage.from("documents").upload(path, new TextEncoder().encode(content), { upsert: true });
  await admin.from("documents").update({ storage_path: path }).eq("id", doc!.id);

  const result = await processDocument(admin, admin, doc!.id);
  console.log(`${result.status === "ready" ? "PASS" : "FAIL"}  NUL-containing doc reaches ready -> ${result.status}${result.error ? ` (${result.error})` : ` (${result.chunks} chunks)`}`);

  const { data: chunks } = await admin.from("chunks").select("content").eq("document_id", doc!.id);
  const hasNul = (chunks ?? []).some((c) => (c.content as string).includes(NUL));
  console.log(`${!hasNul && (chunks?.length ?? 0) > 0 ? "PASS" : "FAIL"}  stored chunks are NUL-free`);

  await admin.auth.admin.deleteUser(userId);
}

main().catch((e) => { console.error(e); process.exit(1); });
