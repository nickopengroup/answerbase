import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-medium tracking-wide text-brand">Answerbase</p>
        <h1 className="mt-3 text-3xl text-ink">
          Your documents, answering for you.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Turn your firm&apos;s documents into a client-facing AI assistant — a
          chat inside the app and an embeddable widget for your website.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" disabled>
            Coming soon
          </Button>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Phase 0 scaffold — the product is being built phase by phase.
        </p>
      </div>
    </main>
  );
}
