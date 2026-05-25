import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence Turbopack workspace root warning by explicitly setting root
  turbopack: {
    root: __dirname,
  },
  // Allow images from external domains used by AppKit and GoodDollar
  images: {
    domains: ["tsarosafe.com", "gooddollar.org"],
  },
};

export default nextConfig;
