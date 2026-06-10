import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  allowedDevOrigins: ["212.86.105.35"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "212.86.105.35:3000"],
    },
  },
};

export default nextConfig;
