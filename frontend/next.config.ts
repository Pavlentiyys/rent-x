import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Local Minio
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        // Railway Minio
        protocol: "https",
        hostname: "minio-production-9654.up.railway.app",
        pathname: "/**",
      },
      {
        // Any HTTPS CDN / production storage
        protocol: "https",
        hostname: "**",
      },
      {
        // picsum fallback used in marketplace
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
