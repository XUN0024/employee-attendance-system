import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Only for build verification - should be removed in production
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
