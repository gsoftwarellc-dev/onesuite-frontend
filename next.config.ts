import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker/Cloud Run deployment
  output: 'standalone',

  // Optional: Configure image optimization for Cloud Run
  images: {
    unoptimized: true, // or configure external image optimization
  },
};

export default nextConfig;

