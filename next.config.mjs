import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // “@” now points at your project root (where next.config.mjs lives)
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;