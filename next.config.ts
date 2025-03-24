import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.moderncomputer.in",
      },
    ],
  },
};

export default nextConfig;
