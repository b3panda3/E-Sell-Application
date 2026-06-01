import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (all app env vars)
config({ path: ".env.local", override: true });

// Load .env second WITHOUT override — only fills in missing vars
config({ path: ".env", override: false });

// For Prisma schema operations (db push, migrate), we need a connection
// that supports full PostgreSQL sessions (prepared statements, etc.)
//
// Supabase connection types:
//   - Session pooler (port 5432) — WORKS with Prisma db push/migrate
//   - Transaction pooler (port 6543) — HANGS on db push (no session support)
//   - Direct (db.xxx.supabase.co) — may be unreachable for some projects
//
// Priority: DIRECT_URL > DATABASE_URL (session pooler on port 5432)
const datasourceUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL!;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
