import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The widget page is meant to be framed on any customer site.
        // Allow framing everywhere and do not send X-Frame-Options.
        source: "/w/:token*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
