import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("owner_id", user!.id)
    .single();

  const plan = workspace?.plan ?? "free";

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h1 className="text-2xl text-ink">Billing</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your plan and usage.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current plan</CardTitle>
            <Badge
              className={
                plan === "pro"
                  ? "bg-brand-soft text-brand-hover"
                  : "bg-muted text-muted-foreground"
              }
            >
              {plan === "pro" ? "Pro" : "Free"}
            </Badge>
          </div>
          <CardDescription>
            Plan limits and upgrades arrive in a later step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You&apos;re on the {plan === "pro" ? "Pro" : "Free"} plan. Usage
            meters and upgrades will appear here once billing is wired up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
