import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the `middleware` convention to `proxy` (nodejs runtime).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets, the embed script, and image
     * files — otherwise auth redirects could block CSS/JS/images.
     */
    "/((?!_next/static|_next/image|favicon.ico|embed.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
