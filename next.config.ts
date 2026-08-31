import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Poster dari server sumber (IP scraper bisa berganti dalam subnet yang sama)
      { protocol: "http", hostname: "45.11.57.**" },
      // CDN WordPress (i0-i3.wp.com)
      { protocol: "http", hostname: "**.wp.com" },
      { protocol: "https", hostname: "**.wp.com" },
    ],
  },
};

export default nextConfig;
