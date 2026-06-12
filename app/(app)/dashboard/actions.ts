"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { checkLimit, getUsage, planLimit } from "@/lib/limits";
import { DEFAULT_WELCOME } from "@/lib/intro";

const DRAFT_NAME = "Untitled bot";

function botLimitMessage(plan: "free" | "pro"): string {
  const limit = planLimit(plan, "bots");
  return `Your ${plan === "free" ? "Free" : "Pro"} plan includes ${limit} ${limit === 1 ? "bot" : "bots"}. Upgrade on the Billing page to add more.`;
}

/**
 * Create (or reuse) a draft bot for the creation wizard. Reuses an existing
 * empty "Untitled bot" with no documents so reopening the wizard doesn't pile
 * up empty bots. Enforces the bot limit.
 */
export async function createDraftBot(): Promise<{
  botId?: string;
  token?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }
  const workspace = await getOrCreateWorkspace(supabase, user.id);

  // Reuse an existing empty draft if one is lying around.
  const { data: drafts } = await supabase
    .from("bots")
    .select("id, public_token, documents(count)")
    .eq("workspace_id", workspace.id)
    .eq("name", DRAFT_NAME);
  const emptyDraft = (drafts ?? []).find(
    (d) =>
      ((d.documents as unknown as { count: number }[])?.[0]?.count ?? 0) === 0,
  );
  if (emptyDraft) {
    return {
      botId: emptyDraft.id as string,
      token: emptyDraft.public_token as string,
    };
  }

  const usage = await getUsage(supabase, workspace.id);
  if (!checkLimit(usage, workspace.plan, "bots").allowed) {
    return { error: botLimitMessage(workspace.plan) };
  }

  const { data, error } = await supabase
    .from("bots")
    .insert({
      workspace_id: workspace.id,
      name: DRAFT_NAME,
      welcome_message: DEFAULT_WELCOME,
      accent_color: "#047857",
      public_token: randomBytes(16).toString("base64url"),
    })
    .select("id, public_token")
    .single();
  if (error || !data) {
    return { error: "We couldn't start a new bot. Please try again." };
  }

  revalidatePath("/dashboard");
  return { botId: data.id as string, token: data.public_token as string };
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const botInput = z.object({
  name: z.string().trim().min(1, "Give your bot a name.").max(60),
  welcome_message: z
    .string()
    .trim()
    .min(1, "Write a short welcome message.")
    .max(300, "Keep the welcome message under 300 characters."),
  accent_color: z
    .string()
    .regex(HEX_COLOR, "Choose a valid accent color."),
});

export type BotFormState = { error?: string; ok?: boolean };

function readBotInput(formData: FormData) {
  return botInput.safeParse({
    name: formData.get("name"),
    welcome_message: formData.get("welcome_message"),
    accent_color: formData.get("accent_color"),
  });
}

export async function createBot(
  _prev: BotFormState,
  formData: FormData,
): Promise<BotFormState> {
  const parsed = readBotInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  const workspace = await getOrCreateWorkspace(supabase, user.id);

  const usage = await getUsage(supabase, workspace.id);
  if (!checkLimit(usage, workspace.plan, "bots").allowed) {
    return {
      error: `Your ${workspace.plan === "free" ? "Free" : "Pro"} plan includes ${planLimit(workspace.plan, "bots")} ${planLimit(workspace.plan, "bots") === 1 ? "bot" : "bots"}. Upgrade on the Billing page to add more.`,
    };
  }

  const { error } = await supabase.from("bots").insert({
    workspace_id: workspace.id,
    name: parsed.data.name,
    welcome_message: parsed.data.welcome_message,
    accent_color: parsed.data.accent_color,
    public_token: randomBytes(16).toString("base64url"),
  });
  if (error) {
    return { error: "We couldn't create the bot. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateBot(
  botId: string,
  _prev: BotFormState,
  formData: FormData,
): Promise<BotFormState> {
  if (!z.string().uuid().safeParse(botId).success) {
    return { error: "This bot no longer exists." };
  }

  const parsed = readBotInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bots")
    .update({
      name: parsed.data.name,
      welcome_message: parsed.data.welcome_message,
      accent_color: parsed.data.accent_color,
    })
    .eq("id", botId);
  if (error) {
    return { error: "We couldn't save your changes. Please try again." };
  }

  revalidatePath(`/bots/${botId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

const questionsSchema = z
  .array(z.string().trim().min(1).max(140))
  .max(6, "You can have up to 6 suggested questions.");

export async function updateSuggestedQuestions(
  botId: string,
  questions: string[],
): Promise<{ error?: string; ok?: boolean }> {
  if (!z.string().uuid().safeParse(botId).success) {
    return { error: "This bot no longer exists." };
  }
  const parsed = questionsSchema.safeParse(
    questions.map((q) => q.trim()).filter(Boolean),
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bots")
    .update({ suggested_questions: parsed.data })
    .eq("id", botId);
  if (error) {
    return { error: "We couldn't save your questions. Please try again." };
  }

  revalidatePath(`/bots/${botId}`);
  return { ok: true };
}

export async function deleteBot(formData: FormData) {
  const botId = String(formData.get("botId"));
  if (!z.string().uuid().safeParse(botId).success) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("bots").delete().eq("id", botId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
