"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBot } from "@/app/(app)/dashboard/actions";

export function DeleteBotButton({
  botId,
  botName,
}: {
  botId: string;
  botName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete bot
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {botName}?</DialogTitle>
          <DialogDescription>
            This removes the bot, its documents, and its chat history. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Keep bot
          </DialogClose>
          <form action={deleteBot}>
            <input type="hidden" name="botId" value={botId} />
            <Button type="submit" variant="destructive">
              Delete bot
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
