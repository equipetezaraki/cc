import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-0d7f337b40f945f39835d82c45c31e19.r2.dev',
      },
    ],
  },
};

export default nextConfig;
