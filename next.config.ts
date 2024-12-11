import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export", // Enables static export
  trailingSlash: true, // Ensures correct paths for static hosting
};

export default nextConfig;
