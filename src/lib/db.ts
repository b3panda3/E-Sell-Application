import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // For the Next.js runtime, prefer the transaction pooler (port 6543) for
  // better scalability on serverless. Fall back to DATABASE_URL if not set.
  // Prisma CLI (db push, migrate) uses prisma.config.ts which has its own logic.
  const connectionString =
    process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL or DATABASE_POOLER_URL environment variable is not set"
    );
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
