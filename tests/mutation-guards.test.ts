import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const getPrisma = vi.fn();

vi.mock("@/lib/server/prisma", () => ({
  getPrisma
}));

describe("requireTenantPropertyAccess", () => {
  beforeEach(() => {
    findFirst.mockReset();
    getPrisma.mockReset();
    getPrisma.mockResolvedValue({
      property: {
        findFirst
      }
    });
  });

  it("returns the property when the tenant owns it", async () => {
    findFirst.mockResolvedValue({
      id: "prop-harbor",
      slug: "harbor-flats",
      name: "Harbor Flats"
    });

    const { requireTenantPropertyAccess } = await import("@/lib/server/mutation-guards");

    await expect(
      requireTenantPropertyAccess({
        tenantId: "tenant-halcyon",
        propertyId: "prop-harbor"
      })
    ).resolves.toEqual({
      id: "prop-harbor",
      slug: "harbor-flats",
      name: "Harbor Flats"
    });
  });

  it("throws a typed 404 error when the property is outside the tenant boundary", async () => {
    findFirst.mockResolvedValue(null);

    const { requireTenantPropertyAccess } = await import("@/lib/server/mutation-guards");

    await expect(
      requireTenantPropertyAccess({
        tenantId: "tenant-halcyon",
        propertyId: "prop-other"
      })
    ).rejects.toMatchObject({
      code: "property_not_found",
      status: 404
    });
  });
});
