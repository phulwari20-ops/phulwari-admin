import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.28', '192.168.1.28:3000'],
  turbopack: {
    root: path.resolve(__dirname),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
