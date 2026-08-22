import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@harikos/core", "@harikos/db"],
};

export default nextConfig;
