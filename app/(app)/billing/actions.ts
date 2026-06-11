"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateWorkspace } from "@/lib/workspace";
import type { Plan } from "@/lib/types";

// Mock billing: flip the plan directly. No payment processor (see docs).
async function setPlan(plan: Plan) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const workspace = await getOrCreateWorkspace(supabase, user.id);
  await supabase.from("workspaces").update({ plan }).eq("id", workspace.id);

  revalidatePath("/billing");
  revalidatePath("/dashboard");
}

export async function upgradeToPro() {
  await setPlan("pro");
}

export async function downgradeToFree() {
  await setPlan("free");
}
