"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BotFields } from "@/components/app/bot-fields";
import { createBot, type BotFormState } from "./actions";

export function CreateBotDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<BotFormState, FormData>(
    createBot,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      toast.success("Your bot is ready.");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New bot
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create a bot</DialogTitle>
            <DialogDescription>
              Name it and set its greeting. You can change these any time.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <BotFields />
          </div>

          {state.error ? (
            <p className="pb-2 text-sm text-danger" role="alert">
              {state.error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create bot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
