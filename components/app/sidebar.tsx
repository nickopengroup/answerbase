"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CreditCard, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(app)/actions";

const NAV = [
  { href: "/dashboard", label: "Bots", icon: Bot },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-5 py-5">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-wide text-brand"
        >
          Answerbase
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand-hover"
                  : "text-muted-foreground hover:bg-background hover:text-ink",
              )}
            >
              <Icon className="size-[18px] stroke-[1.5]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <p className="truncate px-3 pb-2 text-xs text-muted-foreground">
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-ink"
          >
            <LogOut className="size-[18px] stroke-[1.5]" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
