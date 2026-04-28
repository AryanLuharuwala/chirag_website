import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is only for Docker/Azure — remove for Vercel
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
