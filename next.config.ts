import type { NextConfig } from "next";

const rawUrl = process.env.APP_URL || process.env.NEXTAUTH_URL;
const appUrl = rawUrl && rawUrl.startsWith("http") ? rawUrl : "http://localhost:3000";
process.env.NEXTAUTH_URL = appUrl;
process.env.AUTH_URL = appUrl;

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    AUTH_URL: appUrl,
    NEXTAUTH_URL: appUrl,
  },
};

export default nextConfig;
