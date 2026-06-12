import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWidgetBot } from "@/lib/widget";
import { WidgetChat } from "@/components/widget/widget-chat";

export const runtime = "nodejs";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bot = await resolveWidgetBot(createAdminClient(), token);

  if (!bot) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-sm font-medium text-ink">This chat isn&apos;t available</p>
        <p className="text-sm text-muted-foreground">
          The link may be broken or the assistant was removed.
        </p>
      </div>
    );
  }

  return (
    <WidgetChat
      token={token}
      name={bot.name}
      welcomeMessage={bot.welcomeMessage}
      accentColor={bot.accentColor}
      showPoweredBy={bot.plan === "free"}
      suggestedQuestions={bot.suggestedQuestions}
    />
  );
}
