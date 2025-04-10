import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "supabase.moderncomputer.in",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "razorpay.com"
      }
    ],
  },
  compiler: {
    removeConsole: true,
  },
};

export default nextConfig;
