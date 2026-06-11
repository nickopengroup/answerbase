import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "../auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Welcome back. Sign in to manage your bots.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notice === "confirm" ? (
          <p className="mb-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand-hover">
            Check your email to confirm your account, then sign in.
          </p>
        ) : null}
        <AuthForm mode="login" />
      </CardContent>
    </Card>
  );
}
