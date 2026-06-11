"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BotFields } from "@/components/app/bot-fields";
import { updateBot, type BotFormState } from "@/app/(app)/dashboard/actions";
import type { Bot } from "@/lib/types";

export function EditBotForm({ bot }: { bot: Bot }) {
  const action = updateBot.bind(null, bot.id);
  const [state, formAction, pending] = useActionState<BotFormState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Changes saved.");
    }
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <BotFields defaults={bot} />

      {state.error ? (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
