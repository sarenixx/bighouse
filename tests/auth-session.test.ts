import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.fn();
const cookieDelete = vi.fn();
const findUnique = vi.fn();
const deleteSession = vi.fn();
const getPrisma = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookieGet,
    delete: cookieDelete
  }))
}));

vi.mock("@/lib/server/prisma", () => ({
  getPrisma
}));

describe("getCurrentSession", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieGet.mockReset();
    cookieDelete.mockReset();
    findUnique.mockReset();
    deleteSession.mockReset();
    getPrisma.mockReset();
    getPrisma.mockResolvedValue({
      session: {
        findUnique,
        delete: deleteSession
      }
    });
  });

  it("returns null for an expired session without mutating cookies during render", async () => {
    cookieGet.mockReturnValue({ value: "expired-token" });
    findUnique.mockResolvedValue({
      id: "session-expired",
      token: "expired-token",
      tenantId: "tenant-halcyon",
      expiresAt: new Date(Date.now() - 60_000),
      user: {
        id: "user-trustee",
        name: "Avery Bennett",
        email: "demo@example.com",
        role: "Trust Officer"
      },
      tenant: {
        id: "tenant-halcyon",
        name: "Halcyon Family Office"
      }
    });
    deleteSession.mockResolvedValue(undefined);

    const { getCurrentSession } = await import("@/lib/server/auth");

    await expect(getCurrentSession()).resolves.toBeNull();
    expect(deleteSession).toHaveBeenCalledWith({ where: { token: "expired-token" } });
    expect(cookieDelete).not.toHaveBeenCalled();
  });

  it("returns null when the cookie token no longer maps to a stored session", async () => {
    cookieGet.mockReturnValue({ value: "missing-token" });
    findUnique.mockResolvedValue(null);

    const { getCurrentSession } = await import("@/lib/server/auth");

    await expect(getCurrentSession()).resolves.toBeNull();
    expect(deleteSession).not.toHaveBeenCalled();
    expect(cookieDelete).not.toHaveBeenCalled();
  });
});
