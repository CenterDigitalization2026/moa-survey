import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "heartzilla",
    "heartzilla.local",
    "*.local",
    "192.168.100.170",
    "192.168.100.*",
    "192.168.*.*",
    "10.*.*.*",
    "localhost",
    "127.0.0.1",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "heartzilla:3000",
        "heartzilla",
        "heartzilla.local:3000",
        "heartzilla.local",
        "*.local",
        "*.local:3000",
        "192.168.100.170:3000",
        "192.168.100.170",
        "192.168.100.*:3000",
        "192.168.100.*",
        "192.168.*.*:3000",
        "192.168.*.*",
        "10.*.*.*:3000",
        "10.*.*.*",
        "localhost:3000",
        "localhost",
        "127.0.0.1:3000",
        "127.0.0.1",
      ],
    },
  },
};

export default nextConfig;
