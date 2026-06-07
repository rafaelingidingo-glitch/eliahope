import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Exclude non-essential server files from the build
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    // Uncomment when switching to PostgreSQL:
    // "pg",
    // "@prisma/adapter-pg",
    // Uncomment when switching to MySQL:
    // "mariadb",
    // "@prisma/adapter-mariadb",
  ],
};

export default nextConfig;
