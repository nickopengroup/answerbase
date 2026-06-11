import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets, the embed script, image files,
     * and the public widget surfaces (/w and /api/widget) which are
     * unauthenticated by design and must not be touched by the auth proxy.
     */
    "/((?!_next/static|_next/image|favicon.ico|embed.js|w/|api/widget/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
