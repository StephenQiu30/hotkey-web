import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8080/api/:path*",
      },
      {
        source: "/healthz",
        destination: "http://127.0.0.1:8080/healthz",
      },
    ];
  },
};

export default nextConfig;
