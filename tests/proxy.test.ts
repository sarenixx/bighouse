import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const consumeApiRateLimit = vi.fn();
const getRequestClientIp = vi.fn();

vi.mock("@/lib/server/api-rate-limit", () => ({
  consumeApiRateLimit
}));

vi.mock("@/lib/server/login-rate-limit", () => ({
  getRequestClientIp
}));

describe("proxy", () => {
  beforeEach(() => {
    vi.resetModules();
    consumeApiRateLimit.mockReset();
    getRequestClientIp.mockReset();

    consumeApiRateLimit.mockResolvedValue({
      ok: true,
      limit: 60,
      remaining: 59,
      retryAfterSeconds: 60
    });
    getRequestClientIp.mockReturnValue("203.0.113.10");
  });

  it("redirects anonymous protected-page requests to login with a from parameter", async () => {
    const { proxy } = await import("@/proxy");

    const response = await proxy(new NextRequest("http://localhost/tasks?view=open"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?from=%2Ftasks%3Fview%3Dopen");
  });

  it("allows the login page through even when a stale session cookie is present", async () => {
    const { proxy } = await import("@/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/login", {
        headers: {
          cookie: "bh_session=stale-token"
        }
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
