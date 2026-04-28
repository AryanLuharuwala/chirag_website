import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker / Azure Web App
  output: "standalone",

  // Allow the design-placeholder color values to pass through
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default nextConfig;
