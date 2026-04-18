import { beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn();
const signOut = vi.fn();
const getCurrentSession = vi.fn();
const consumeLoginRateLimit = vi.fn();
const clearLoginRateLimit = vi.fn();
const buildLoginRateLimitKey = vi.fn();
const getRequestClientIp = vi.fn();

vi.mock("@/lib/server/auth", () => ({
  signIn,
  signOut,
  getCurrentSession
}));

vi.mock("@/lib/server/login-rate-limit", () => ({
  consumeLoginRateLimit,
  clearLoginRateLimit,
  buildLoginRateLimitKey,
  getRequestClientIp
}));

describe("auth routes", () => {
  beforeEach(() => {
    vi.resetModules();
    signIn.mockReset();
    signOut.mockReset();
    getCurrentSession.mockReset();
    consumeLoginRateLimit.mockReset();
    clearLoginRateLimit.mockReset();
    buildLoginRateLimitKey.mockReset();
    getRequestClientIp.mockReset();

    getRequestClientIp.mockReturnValue("203.0.113.10");
    buildLoginRateLimitKey.mockImplementation(({ ip, email }) => `${ip}:${email ?? "anonymous"}`);
    consumeLoginRateLimit.mockResolvedValue({
      ok: true,
      limit: 5,
      remaining: 4,
      retryAfterSeconds: 600,
      resetAt: Date.now() + 600_000,
      backend: "memory"
    });
    clearLoginRateLimit.mockResolvedValue(undefined);
  });

  it("returns 200 and clears the rate limit after a successful login", async () => {
    signIn.mockResolvedValue({
      ok: true,
      user: {
        id: "user-trustee",
        name: "Avery Bennett",
        email: "demo@example.com",
        role: "Trust Officer",
        tenantId: "tenant-halcyon",
        tenantName: "Halcyon Family Office"
      }
    });

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo@example.com",
          password: "correct horse battery staple"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      user: {
        email: "demo@example.com"
      }
    });
    expect(signIn).toHaveBeenCalledWith("demo@example.com", "correct horse battery staple");
    expect(clearLoginRateLimit).toHaveBeenCalledTimes(1);
  });

  it("returns 429 when the login limiter blocks the request", async () => {
    consumeLoginRateLimit.mockResolvedValue({
      ok: false,
      limit: 5,
      remaining: 0,
      retryAfterSeconds: 600,
      resetAt: Date.now() + 600_000,
      backend: "memory"
    });

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "demo@example.com",
          password: "wrong-password"
        })
      })
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "Too many login attempts. Please wait a few minutes and try again."
    });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("returns the authenticated session payload without exposing a token", async () => {
    getCurrentSession.mockResolvedValue({
      id: "session-123",
      tenantId: "tenant-halcyon",
      tenantName: "Halcyon Family Office",
      user: {
        id: "user-trustee",
        name: "Avery Bennett",
        email: "demo@example.com",
        role: "Trust Officer"
      }
    });

    const { GET } = await import("@/app/api/session/route");
    const response = await GET();

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      authenticated: true,
      session: {
        tenantId: "tenant-halcyon",
        user: {
          email: "demo@example.com"
        }
      }
    });
    expect(body.session).not.toHaveProperty("token");
  });

  it("returns authenticated false when there is no session", async () => {
    getCurrentSession.mockResolvedValue(null);

    const { GET } = await import("@/app/api/session/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: false });
  });

  it("invalidates the server session on logout", async () => {
    signOut.mockResolvedValue(undefined);

    const { POST } = await import("@/app/api/auth/logout/route");
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
