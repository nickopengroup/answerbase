import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Bot } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditBotForm } from "./edit-bot-form";
import { DeleteBotButton } from "./delete-bot-button";

export default async function BotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: bot } = await supabase
    .from("bots")
    .select("*")
    .eq("id", id)
    .single<Bot>();

  if (!bot) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Bots
      </Link>

      <h1 className="mt-4 flex items-center gap-3 text-2xl text-ink">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: bot.accent_color }}
        />
        {bot.name}
      </h1>

      <div className="mt-8 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              How your bot introduces itself and looks in the widget.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditBotForm bot={bot} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Upload the documents your bot answers from. Coming in the next
              step.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-danger/30">
          <CardHeader>
            <CardTitle>Delete this bot</CardTitle>
            <CardDescription>
              Permanently remove this bot and everything attached to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteBotButton botId={bot.id} botName={bot.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
