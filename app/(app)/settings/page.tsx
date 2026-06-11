import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-8 py-8">
      <h1 className="text-2xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your account.</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>The email you sign in with.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink">{user?.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
