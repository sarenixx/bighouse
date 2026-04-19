import { beforeEach, describe, expect, it, vi } from "vitest";

const getCloudflareContext = vi.fn();

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext
}));

class FakeD1Database {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  prepare(_query: string) {
    return {
      bind: (...values: Array<string | number>) => ({
        first: async <T>() => {
          const [storageKey, nextResetAt, now] = values as [string, number, number];
          const current = this.buckets.get(storageKey);

          if (!current || current.resetAt <= now) {
            const fresh = { count: 1, resetAt: nextResetAt };
            this.buckets.set(storageKey, fresh);
            return fresh as T;
          }

          const updated = {
            count: current.count + 1,
            resetAt: current.resetAt
          };
          this.buckets.set(storageKey, updated);
          return updated as T;
        },
        run: async () => {
          const [storageKey] = values as [string];
          this.buckets.delete(storageKey);
          return {};
        }
      })
    };
  }
}

describe("rate-limit store", () => {
  beforeEach(() => {
    vi.resetModules();
    getCloudflareContext.mockReset();
  });

  it("uses the Cloudflare D1 binding when available", async () => {
    const db = new FakeD1Database();
    getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const { consumeRateLimit, clearRateLimit } = await import("@/lib/server/rate-limit-store");

    const first = await consumeRateLimit({
      namespace: "login",
      key: "203.0.113.10:test@example.com",
      limit: 2,
      windowMs: 60_000,
      now: 1_700_000_000_000
    });

    const second = await consumeRateLimit({
      namespace: "login",
      key: "203.0.113.10:test@example.com",
      limit: 2,
      windowMs: 60_000,
      now: 1_700_000_000_000
    });

    expect(first.backend).toBe("d1");
    expect(first.remaining).toBe(1);
    expect(second.backend).toBe("d1");
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(0);

    const blocked = await consumeRateLimit({
      namespace: "login",
      key: "203.0.113.10:test@example.com",
      limit: 2,
      windowMs: 60_000,
      now: 1_700_000_000_000
    });

    expect(blocked.backend).toBe("d1");
    expect(blocked.ok).toBe(false);

    await clearRateLimit({
      namespace: "login",
      key: "203.0.113.10:test@example.com"
    });

    const reset = await consumeRateLimit({
      namespace: "login",
      key: "203.0.113.10:test@example.com",
      limit: 2,
      windowMs: 60_000,
      now: 1_700_000_000_000
    });

    expect(reset.backend).toBe("d1");
    expect(reset.ok).toBe(true);
    expect(reset.remaining).toBe(1);
  });
});
