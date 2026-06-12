import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWidgetBot } from "@/lib/widget";
import { WidgetEmbed } from "@/components/widget/widget-embed";

export const runtime = "nodejs";

export const metadata = {
  title: "Widget preview",
  robots: { index: false },
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bot = await resolveWidgetBot(createAdminClient(), token);

  if (!bot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <p className="text-sm font-medium text-ink">Preview unavailable</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This widget link is invalid or the bot was removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-[17px]">
      {/* Preview notice */}
      <div className="border-b border-border bg-accent-soft px-6 py-2 text-center text-[13px] text-brand-hover">
        Widget preview — a sample website to see your assistant in action. Your
        real site isn&apos;t affected.
      </div>

      {/* Mock customer website */}
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <span className="font-semibold tracking-tight text-ink">
          Northwind &amp; Co.
        </span>
        <nav className="hidden gap-6 text-[15px] text-muted-foreground sm:flex">
          <span>Services</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-6">
        <section className="py-20">
          <h1 className="max-w-2xl text-4xl leading-tight text-ink">
            Trusted local services, done right the first time.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            We help small businesses stay organized and stress-free. Have a
            question? Use the chat in the corner — it answers from our own
            documents.
          </p>
        </section>

        <section className="grid gap-6 border-t border-border py-16 sm:grid-cols-3">
          {[
            ["Clear answers", "Get accurate information without waiting for a callback."],
            ["Always on", "The assistant is available any time, day or night."],
            ["From our docs", "Every answer comes straight from our own materials."],
          ].map(([title, body]) => (
            <div key={title}>
              <h2 className="font-medium text-ink">{title}</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-8 text-[14px] text-muted-foreground">
          © Northwind &amp; Co. — sample preview page.
        </div>
      </footer>

      <WidgetEmbed token={token} />
    </div>
  );
}
