import { beforeEach, describe, expect, it } from "vitest";

import {
  buildLoginRateLimitKey,
  clearLoginRateLimit,
  consumeLoginRateLimit,
  getRequestClientIp
} from "@/lib/server/login-rate-limit";

describe("login rate limiting", () => {
  const key = buildLoginRateLimitKey({
    ip: "203.0.113.10",
    email: "trustee@example.com"
  });

  beforeEach(() => {
    clearLoginRateLimit(key);
  });

  it("uses the first forwarded IP address when present", () => {
    const request = new Request("http://localhost/api/auth/login", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 198.51.100.20"
      }
    });

    expect(getRequestClientIp(request)).toBe("203.0.113.10");
  });

  it("allows the first five attempts and blocks the sixth", async () => {
    const now = 1_700_000_000_000;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const result = await consumeLoginRateLimit(key, now);
      expect(result.ok).toBe(true);
    }

    const blocked = await consumeLoginRateLimit(key, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after a successful login clear", async () => {
    const now = 1_700_000_000_000;

    await consumeLoginRateLimit(key, now);
    await clearLoginRateLimit(key);

    const result = await consumeLoginRateLimit(key, now);
    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(4);
  });
});
