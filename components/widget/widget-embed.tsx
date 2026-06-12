"use client";

import { useEffect } from "react";

/**
 * Injects the real embed.js script the same way a customer's site would, so
 * the preview page shows the actual widget (launcher + iframe), not a mock.
 */
export function WidgetEmbed({ token }: { token: string }) {
  useEffect(() => {
    if (document.querySelector("script[data-answerbase-preview]")) return;
    const script = document.createElement("script");
    script.src = "/embed.js";
    script.async = true;
    script.setAttribute("data-bot", token);
    script.setAttribute("data-answerbase-preview", "1");
    document.body.appendChild(script);
  }, [token]);

  return null;
}
