import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

export function getD1HttpParams() {
  const {
    CLOUDFLARE_D1_TOKEN,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
    CLOUDFLARE_SHADOW_DATABASE_ID
  } = process.env;

  if (!CLOUDFLARE_D1_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID) {
    return null;
  }

  return {
    CLOUDFLARE_D1_TOKEN,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
    ...(CLOUDFLARE_SHADOW_DATABASE_ID
      ? { CLOUDFLARE_SHADOW_DATABASE_ID }
      : {})
  };
}

export function createPrismaClient({ forceLocal = false }: { forceLocal?: boolean } = {}) {
  if (forceLocal) {
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? "file:./dev.db"
      })
    });
  }

  const d1HttpParams = getD1HttpParams();

  if (d1HttpParams) {
    return new PrismaClient({
      adapter: new PrismaD1(d1HttpParams)
    });
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db"
    })
  });
}
