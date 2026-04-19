import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";

type CloudflareEnvLike = {
  DB?: object;
};

declare global {
  var __prismaLocal: PrismaClient | undefined;
  var __prismaD1Clients: WeakMap<object, PrismaClient> | undefined;
}

function createLocalPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db"
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });
}

function getLocalPrismaClient() {
  global.__prismaLocal ??= createLocalPrismaClient();
  return global.__prismaLocal;
}

async function getCloudflareD1Binding() {
  try {
    const context = getCloudflareContext();
    const env = context.env as CloudflareEnvLike | undefined;

    if (env?.DB && typeof env.DB === "object") {
      return env.DB;
    }
  } catch {}

  try {
    const context = await getCloudflareContext({ async: true });
    const env = context.env as CloudflareEnvLike | undefined;

    return env?.DB && typeof env.DB === "object" ? env.DB : null;
  } catch {
    return null;
  }
}

function getD1ClientCache() {
  global.__prismaD1Clients ??= new WeakMap<object, PrismaClient>();
  return global.__prismaD1Clients;
}

export async function getPrisma() {
  const d1Binding = await getCloudflareD1Binding();

  if (!d1Binding) {
    return getLocalPrismaClient();
  }

  const cache = getD1ClientCache();
  const cached = cache.get(d1Binding);

  if (cached) {
    return cached;
  }

  const adapter = new PrismaD1(d1Binding as ConstructorParameters<typeof PrismaD1>[0]);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

  cache.set(d1Binding, prisma);
  return prisma;
}

export async function isCloudflareRuntime() {
  return Boolean(await getCloudflareD1Binding());
}
