type MemoryBucket = {
  count: number;
  resetAt: number;
};

type ConsumeArgs = {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

export type RateLimitResult = {
  ok: boolean;
  count: number;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
  backend: "memory" | "redis";
};

const redisUrl = process.env.REDIS_URL?.trim();
const redisPrefix = process.env.RATE_LIMIT_REDIS_PREFIX?.trim() || "amseta:rate-limit";
const memoryBuckets = new Map<string, MemoryBucket>();

type RedisModule = typeof import("redis");
type RedisCreateClient = RedisModule["createClient"];
type ConnectedRedisClient = Awaited<ReturnType<ReturnType<RedisCreateClient>["connect"]>>;

let redisClient: ConnectedRedisClient | null = null;
let redisConnectPromise: Promise<ConnectedRedisClient> | null = null;
let redisModulePromise: Promise<RedisModule> | null = null;

const consumeScript = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { current, ttl }
`;

function getMemoryBucket(storageKey: string, now: number, windowMs: number) {
  const current = memoryBuckets.get(storageKey);

  if (!current || current.resetAt <= now) {
    const fresh = {
      count: 0,
      resetAt: now + windowMs
    };
    memoryBuckets.set(storageKey, fresh);
    return fresh;
  }

  return current;
}

function buildRateLimitResult(input: {
  count: number;
  limit: number;
  resetAt: number;
  now: number;
  backend: "memory" | "redis";
}): RateLimitResult {
  return {
    ok: input.count <= input.limit,
    count: input.count,
    limit: input.limit,
    remaining: Math.max(0, input.limit - input.count),
    retryAfterSeconds: Math.max(1, Math.ceil((input.resetAt - input.now) / 1000)),
    resetAt: input.resetAt,
    backend: input.backend
  };
}

async function getRedisClient() {
  if (!redisUrl) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (redisConnectPromise) {
    return redisConnectPromise;
  }

  redisModulePromise ??= import("redis");
  const { createClient } = await redisModulePromise;
  const client = createClient({ url: redisUrl });
  redisConnectPromise = client.connect().then(() => {
    redisClient = client;
    redisConnectPromise = null;
    return client;
  });

  return redisConnectPromise;
}

export async function consumeRateLimit(args: ConsumeArgs): Promise<RateLimitResult> {
  const now = args.now ?? Date.now();
  const storageKey = `${args.namespace}:${args.key}`;

  const client = await getRedisClient();

  if (client) {
    const redisKey = `${redisPrefix}:${storageKey}`;
    const raw = (await client.eval(consumeScript, {
      keys: [redisKey],
      arguments: [String(args.windowMs)]
    })) as unknown as [number, number];

    const count = Number(raw[0] ?? 0);
    const ttlMs = Math.max(0, Number(raw[1] ?? args.windowMs));

    return buildRateLimitResult({
      count,
      limit: args.limit,
      resetAt: now + ttlMs,
      now,
      backend: "redis"
    });
  }

  const bucket = getMemoryBucket(storageKey, now, args.windowMs);
  bucket.count += 1;

  return buildRateLimitResult({
    count: bucket.count,
    limit: args.limit,
    resetAt: bucket.resetAt,
    now,
    backend: "memory"
  });
}

export async function clearRateLimit(args: { namespace: string; key: string }) {
  const storageKey = `${args.namespace}:${args.key}`;
  memoryBuckets.delete(storageKey);

  const client = await getRedisClient();

  if (client) {
    await client.del(`${redisPrefix}:${storageKey}`);
  }
}
