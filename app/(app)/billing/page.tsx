import { createClient } from "@/lib/supabase/server";
import { getOrCreateWorkspace } from "@/lib/workspace";
import { getUsage, PLANS, PRO_PRICE } from "@/lib/limits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { downgradeToFree, upgradeToPro } from "./actions";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const workspace = await getOrCreateWorkspace(supabase, user!.id);
  const usage = await getUsage(supabase, workspace.id);

  const plan = workspace.plan;
  const limits = PLANS[plan];
  const isPro = plan === "pro";

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h1 className="text-2xl text-ink">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your plan and this month&apos;s usage.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isPro ? "Pro" : "Free"} plan</CardTitle>
              <CardDescription>
                {isPro
                  ? `${PRO_PRICE}, billed monthly.`
                  : "Everything you need to try Answerbase."}
              </CardDescription>
            </div>
            <Badge
              className={
                isPro
                  ? "bg-brand-soft text-brand-hover"
                  : "bg-muted text-muted-foreground"
              }
            >
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Meter label="Bots" used={usage.bots} limit={limits.bots} />
          <Meter label="Document pages" used={usage.pages} limit={limits.pages} />
          <Meter
            label="Messages this month"
            used={usage.messages}
            limit={limits.messages}
          />

          <div className="border-t border-border pt-5">
            {isPro ? (
              <form action={downgradeToFree}>
                <Button type="submit" variant="secondary">
                  Downgrade to Free
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Pro raises your limits to {PLANS.pro.bots} bots,{" "}
                  {PLANS.pro.pages} pages, and{" "}
                  {PLANS.pro.messages.toLocaleString()} messages a month.
                </p>
                <form action={upgradeToPro}>
                  <Button type="submit">Upgrade to Pro</Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Billing is simulated for this demo — no card is charged.
      </p>
    </div>
  );
}

function Meter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const ratio = limit > 0 ? used / limit : 0;
  const pct = Math.min(100, Math.round(ratio * 100));
  const tone =
    used >= limit ? "bg-danger" : ratio >= 0.8 ? "bg-warning" : "bg-brand";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-ink">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {used >= limit ? (
        <p className="mt-1 text-xs text-danger">
          You&apos;ve reached your {label.toLowerCase()} limit.
        </p>
      ) : ratio >= 0.8 ? (
        <p className="mt-1 text-xs text-warning">
          You&apos;re close to your {label.toLowerCase()} limit.
        </p>
      ) : null}
    </div>
  );
}
