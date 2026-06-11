/**
 * Phase 1 verification. Proves, with evidence:
 *  - a signed-in user can create their own workspace (RLS self-insert),
 *    which is what the app does on first load (get-or-create)
 *  - a user can create a bot
 *  - RLS hides one user's bot from another user
 *
 * Requires email confirmation to be OFF in Supabase Auth (so signUp returns a
 * session). Run: node --env-file=.env.local scripts/verify-phase1.ts
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function makeUser(tag: string) {
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `phase1-${tag}-${Date.now()}@answerbase.test`;
  const { data, error } = await client.auth.signUp({
    email,
    password: "supersecret123",
  });
  if (error) throw new Error(`signUp failed for ${tag}: ${error.message}`);
  if (!data.session) {
    throw new Error(
      "signUp returned no session — disable 'Confirm email' in Supabase Auth.",
    );
  }
  return { client, userId: data.user!.id, email };
}

async function ensureWorkspace(
  client: ReturnType<typeof createClient>,
  userId: string,
) {
  const sel = await client
    .from("workspaces")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (sel.data) return { workspace: sel.data, error: null };
  const ins = await client
    .from("workspaces")
    .insert({ owner_id: userId, name: "My workspace", plan: "free" })
    .select("*")
    .single();
  return { workspace: ins.data, error: ins.error };
}

async function createBot(
  client: ReturnType<typeof createClient>,
  workspaceId: string,
  name: string,
) {
  const { data, error } = await client
    .from("bots")
    .insert({
      workspace_id: workspaceId,
      name,
      welcome_message: "Hi!",
      accent_color: "#047857",
      public_token: randomBytes(16).toString("base64url"),
    })
    .select("id")
    .single();
  return { id: data?.id as string | undefined, error };
}

async function main() {
  const a = await makeUser("a");
  const b = await makeUser("b");

  // App's get-or-create: a user inserts their own workspace (RLS self-insert).
  const wsA = await ensureWorkspace(a.client, a.userId);
  const wsB = await ensureWorkspace(b.client, b.userId);
  check(
    "user A can create their own workspace",
    !!wsA.workspace,
    wsA.error?.message ?? "",
  );
  check("workspace A defaults to free plan", wsA.workspace?.plan === "free");
  check(
    "user B can create their own workspace",
    !!wsB.workspace,
    wsB.error?.message ?? "",
  );

  // Each user creates a bot in their own workspace.
  const botA = await createBot(
    a.client,
    wsA.workspace!.id as string,
    "A bot",
  );
  const botB = await createBot(
    b.client,
    wsB.workspace!.id as string,
    "B bot",
  );
  check("user A creates a bot", !!botA.id, botA.error?.message ?? "");
  check("user B creates a bot", !!botB.id, botB.error?.message ?? "");

  // RLS: each user sees only their own bot.
  const { data: aSees } = await a.client.from("bots").select("id, name");
  check(
    "user A sees only their own bot",
    aSees?.length === 1 && aSees[0].id === botA.id,
    `sees ${aSees?.length}`,
  );

  const { data: bSeesA } = await b.client
    .from("bots")
    .select("id")
    .eq("id", botA.id!);
  check(
    "user B cannot see user A's bot (RLS)",
    (bSeesA?.length ?? 0) === 0,
    `leaked ${bSeesA?.length}`,
  );

  // Service role sees both — proves the bots exist and RLS is what hides them.
  const { data: allBots } = await admin
    .from("bots")
    .select("id")
    .in("id", [botA.id!, botB.id!]);
  check(
    "service role sees both bots (so RLS, not absence, hid them)",
    allBots?.length === 2,
    `sees ${allBots?.length}`,
  );

  // Cleanup: deleting the users cascades to workspaces, bots, chunks.
  await admin.auth.admin.deleteUser(a.userId);
  await admin.auth.admin.deleteUser(b.userId);
  console.log("\nCleaned up test users.");

  console.log(
    failures === 0
      ? "\nAll Phase 1 checks passed."
      : `\n${failures} check(s) failed.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("\nVerification crashed:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
