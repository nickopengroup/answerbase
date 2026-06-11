import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Bot, DocumentRow } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumentsPanel } from "@/components/app/documents-panel";
import { ChatPanel } from "@/components/app/chat-panel";
import { EmbedSnippet } from "@/components/app/embed-snippet";
import { GapsPanel, type Gap } from "@/components/app/gaps-panel";
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

  const { data: documents } = await supabase
    .from("documents")
    .select("id, filename, kind, status, error_message, page_count")
    .eq("bot_id", bot.id)
    .neq("kind", "gap_answer")
    .order("created_at", { ascending: false })
    .returns<
      Pick<
        DocumentRow,
        "id" | "filename" | "kind" | "status" | "error_message" | "page_count"
      >[]
    >();

  const { data: gapRows } = await supabase
    .from("gap_questions")
    .select("id, question, created_at, conversations(channel)")
    .eq("bot_id", bot.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const gaps: Gap[] = (gapRows ?? []).map((row) => {
    const convo = row.conversations as
      | { channel: "app" | "widget" }
      | { channel: "app" | "widget" }[]
      | null;
    const channel = Array.isArray(convo) ? (convo[0]?.channel ?? null) : (convo?.channel ?? null);
    return {
      id: row.id as string,
      question: row.question as string,
      channel,
      createdAt: row.created_at as string,
    };
  });

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
            <CardTitle>Test chat</CardTitle>
            <CardDescription>
              Ask a question the way your clients will. Answers come only from
              this bot&apos;s documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChatPanel botId={bot.id} welcomeMessage={bot.welcome_message} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Unanswered questions
              {gaps.length > 0 ? (
                <span className="ml-2 rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand-hover">
                  {gaps.length}
                </span>
              ) : null}
            </CardTitle>
            <CardDescription>
              Questions your bot couldn&apos;t answer. Answer one and it joins
              the bot&apos;s knowledge instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GapsPanel initialGaps={gaps} />
          </CardContent>
        </Card>

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
              Upload the documents your bot answers from. They&apos;re parsed
              and indexed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentsPanel botId={bot.id} initialDocuments={documents ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embed</CardTitle>
            <CardDescription>
              Add the chat widget to your website with one line of code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbedSnippet
              appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
              token={bot.public_token}
            />
          </CardContent>
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
