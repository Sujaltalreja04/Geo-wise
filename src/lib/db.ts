import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Auto-configure DATABASE_URL for local and serverless/cloud environments (e.g. Vercel)
if (!process.env.DATABASE_URL || process.env.VERCEL) {
  const localDb = path.join(process.cwd(), "db", "custom.db");
  const tmpDb = path.join("/tmp", "custom.db");

  if (process.env.VERCEL) {
    try {
      // In Vercel serverless functions, the root is read-only.
      // Copy SQLite file to /tmp so queries and locks have write permissions.
      if (!fs.existsSync(tmpDb) && fs.existsSync(localDb)) {
        fs.copyFileSync(localDb, tmpDb);
      }
      process.env.DATABASE_URL = `file:${tmpDb}`;
    } catch (e) {
      console.warn("Vercel SQLite fallback warning:", e);
      if (!process.env.DATABASE_URL) {
        process.env.DATABASE_URL = `file:${localDb}`;
      }
    }
  } else if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${localDb}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const prisma = db;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;