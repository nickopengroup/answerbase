import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";

export const metadata = {
  title: "Answerbase — Your documents, answering your clients",
  description:
    "Turn the documents you already have into a chat assistant for your website. Instant, accurate answers from your own content — and honest 'I don't know' when it's not there.",
};

const ctaPrimary =
  "inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90";
const ctaSecondary =
  "inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-base font-medium text-ink transition-colors hover:bg-muted";

function Shot({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border shadow-[0_8px_30px_rgb(0_0_0/0.08)] ${className ?? ""}`}
    >
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-20 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl leading-tight text-ink sm:text-5xl">
          Your documents, answering your clients.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Answerbase turns the FAQs, guides, and policies you already have into
          a chat assistant for your website — so clients get instant, accurate
          answers and your team stops repeating itself.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup" className={ctaPrimary}>
            Start free
          </Link>
          <Link href="#pricing" className={ctaSecondary}>
            See pricing
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-lg">
          <Shot
            src="/screenshots/chat.png"
            alt="The assistant answering a pricing question with the source document cited"
            width={608}
            height={543}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <h2 className="text-center text-3xl text-ink">Live in three steps</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            No setup call, no training data, no machine-learning jargon. Bring
            your documents and you&apos;re done.
          </p>

          <div className="mt-16 flex flex-col gap-20">
            <Step
              n="1"
              title="Upload your documents"
              body="Add the FAQs, pricing sheets, and onboarding guides you already have. PDF, Markdown, or text — Answerbase parses and indexes them automatically, with a clear status for each file."
              shot={{ src: "/screenshots/documents.png", alt: "Document upload list showing a file marked Ready", width: 608, height: 205 }}
            />
            <Step
              n="2"
              title="Test it in your dashboard"
              body="Ask questions the way your clients do. Answers come only from your documents and cite the source they came from, so you can trust what your clients will see."
              shot={{ src: "/screenshots/dashboard.png", alt: "The Answerbase dashboard with a bot", width: 1280, height: 860 }}
              flip
            />
            <Step
              n="3"
              title="Embed it on your site"
              body="Copy one line of code and the chat widget appears on your website, in your accent color. Clients ask in the corner; you do nothing."
              shot={{ src: "/screenshots/widget.png", alt: "The chat widget embedded on a bookkeeping firm's website", width: 1180, height: 820 }}
            />
          </div>
        </div>
      </section>

      {/* Gap detection */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-brand">Never guesses</p>
            <h2 className="mt-2 text-3xl text-ink">
              When it doesn&apos;t know, it says so.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most chatbots make things up. Answerbase refuses honestly when an
              answer isn&apos;t in your documents — and logs the question for
              you. Answer it once, and your assistant knows it from then on.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "No invented prices, dates, or policies",
                "Every unanswered question captured, not lost",
                "Your answer becomes part of the knowledge base instantly",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-ink">
                  <Check className="mt-0.5 size-5 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Shot
            src="/screenshots/gaps.png"
            alt="The unanswered questions list where an owner can answer a gap"
            width={608}
            height={209}
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <h2 className="text-center text-3xl text-ink">Simple pricing</h2>
          <p className="mt-3 text-center text-muted-foreground">
            Start free. Upgrade when your clients keep you busy.
          </p>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            <PlanCard
              name="Free"
              price="$0"
              cadence="forever"
              features={[
                "1 bot",
                "20 document pages",
                "100 messages / month",
                "“Powered by Answerbase” on the widget",
              ]}
              cta="Start free"
            />
            <PlanCard
              name="Pro"
              price="$29"
              cadence="per month"
              highlight
              features={[
                "3 bots",
                "500 document pages",
                "2,000 messages / month",
                "No Answerbase branding",
              ]}
              cta="Start free"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="mx-auto max-w-xl text-3xl text-ink">
          Stop answering the same questions.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Set up your assistant in a few minutes and hand the repetitive
          questions to it.
        </p>
        <div className="mt-8">
          <Link href="/signup" className={ctaPrimary}>
            Start free
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  title,
  body,
  shot,
  flip,
}: {
  n: string;
  title: string;
  body: string;
  shot: { src: string; alt: string; width: number; height: number };
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div className={flip ? "md:order-2" : ""}>
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand-hover">
          {n}
        </span>
        <h3 className="mt-4 text-2xl text-ink">{title}</h3>
        <p className="mt-3 text-muted-foreground">{body}</p>
      </div>
      <div className={flip ? "md:order-1" : ""}>
        <Shot src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  features,
  cta,
  highlight,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-background p-6 ${highlight ? "border-brand" : "border-border"}`}
    >
      <p className="font-medium text-ink">{name}</p>
      <p className="mt-3">
        <span className="text-3xl text-ink tabular-nums">{price}</span>{" "}
        <span className="text-[15px] text-muted-foreground">{cadence}</span>
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[15px] text-ink">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/signup"
        className={
          highlight
            ? `${ctaPrimary} mt-6 w-full`
            : `${ctaSecondary} mt-6 w-full`
        }
      >
        {cta}
      </Link>
    </div>
  );
}
