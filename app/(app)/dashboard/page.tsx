import Link from "next/link";
import { Bot as BotIcon, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Bot } from "@/lib/types";
import { Button } from "@/components/ui/button";

function NewBotButton() {
  return (
    <Button render={<Link href="/bots/new" />}>
      <Plus className="size-4" />
      New bot
    </Button>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: bots } = await supabase
    .from("bots")
    .select("id, name, welcome_message, accent_color, public_token, created_at")
    .order("created_at", { ascending: false })
    .returns<Bot[]>();

  const hasBots = bots && bots.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-8 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ink">Bots</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Each bot answers from the documents you give it.
          </p>
        </div>
        {hasBots ? <NewBotButton /> : null}
      </header>

      {!hasBots ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {bots.map((bot) => (
            <li key={bot.id}>
              <Link
                href={`/bots/${bot.id}`}
                className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-ink/20"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: bot.accent_color }}
                  />
                  <h2 className="truncate font-medium text-ink">{bot.name}</h2>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {bot.welcome_message}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft">
        <BotIcon className="size-6 stroke-[1.5] text-brand" />
      </div>
      <h2 className="mt-4 text-lg font-medium text-ink">
        Create your first bot
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        A bot is the assistant your clients talk to. Set it up now, then add
        your documents in the next step.
      </p>
      <div className="mt-6">
        <NewBotButton />
      </div>
    </div>
  );
}
