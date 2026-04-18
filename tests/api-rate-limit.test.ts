import { describe, expect, it } from "vitest";

import {
  consumeApiRateLimit,
  getApiRateLimitPolicy
} from "@/lib/server/api-rate-limit";

describe("API rate limiting", () => {
  it("uses a tighter policy for report generation routes", () => {
    expect(getApiRateLimitPolicy("/api/reports/trustee-report")).toMatchObject({
      key: "reports",
      limit: 30
    });
  });

  it("blocks requests after the route limit is exceeded", async () => {
    const now = 1_700_000_000_000;

    for (let count = 1; count <= 120; count += 1) {
      const result = await consumeApiRateLimit({
        pathname: "/api/properties",
        ip: "203.0.113.10",
        now
      });

      expect(result.ok).toBe(true);
    }

    const blocked = await consumeApiRateLimit({
      pathname: "/api/properties",
      ip: "203.0.113.10",
      now
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
