import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force Turbopack to treat this folder as the app root
    root: __dirname,
  },
};

export default nextConfig;
