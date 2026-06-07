/**
 * Prisma 7 Configuration File
 *
 * In Prisma 7, connection URLs and CLI configuration have been moved out of
 * schema.prisma into this file. The `datasource.url` replaces the old
 * `datasource db { url = env("DATABASE_URL") }` in schema.prisma.
 *
 * This file is used by Prisma CLI commands (migrate, db push, generate, etc.).
 * The runtime database connection is handled via driver adapters in src/lib/db.ts.
 *
 * @see https://pris.ly/d/config-datasource
 */

import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
})
