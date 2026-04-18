import { beforeEach, describe, expect, it, vi } from "vitest";

const createIssueForCurrentTenant = vi.fn();
const updateTaskForCurrentTenant = vi.fn();
const revalidatePath = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath
}));

vi.mock("@/lib/server/portfolio-service", () => ({
  createIssueForCurrentTenant,
  updateTaskForCurrentTenant
}));

describe("write routes", () => {
  beforeEach(() => {
    vi.resetModules();
    createIssueForCurrentTenant.mockReset();
    updateTaskForCurrentTenant.mockReset();
    revalidatePath.mockReset();
  });

  it("creates an issue and revalidates affected pages", async () => {
    createIssueForCurrentTenant.mockResolvedValue(undefined);

    const { POST } = await import("@/app/api/issues/route");
    const response = await POST(
      new Request("http://localhost/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: "prop-harbor",
          title: "Lender package overdue",
          detail: "Weekly lender package has not been delivered for review.",
          severity: "elevated",
          category: "reporting",
          owner: "Owner rep",
          dueDate: "2026-05-01",
          status: "Open",
          propertySlug: "harbor-flats"
        })
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(createIssueForCurrentTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        propertyId: "prop-harbor",
        title: "Lender package overdue"
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/properties");
  });

  it("returns 400 for an invalid issue payload", async () => {
    const { POST } = await import("@/app/api/issues/route");
    const response = await POST(
      new Request("http://localhost/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: "",
          title: "No",
          detail: "short"
        })
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid issue payload."
    });
    expect(createIssueForCurrentTenant).not.toHaveBeenCalled();
  });

  it("translates application errors from issue creation into route responses", async () => {
    const { AppRouteError } = await import("@/lib/server/app-route-error");

    createIssueForCurrentTenant.mockRejectedValue(
      new AppRouteError("Property not found for the current account.", {
        status: 404,
        code: "property_not_found"
      })
    );

    const { POST } = await import("@/app/api/issues/route");
    const response = await POST(
      new Request("http://localhost/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: "prop-missing",
          title: "Insurance review requested",
          detail: "Carrier proposal needs owner review before manager approval.",
          severity: "moderate",
          category: "fees",
          owner: "Owner rep",
          dueDate: "2026-05-05",
          status: "Open"
        })
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Property not found for the current account.",
      code: "property_not_found"
    });
  });

  it("updates a task and revalidates the dashboard and task views", async () => {
    updateTaskForCurrentTenant.mockResolvedValue(undefined);

    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/tasks/task-12", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Complete",
          owner: "Trust officer",
          dueDate: "2026-05-07",
          decisionNeeded: "Board packet approved"
        })
      }),
      { params: Promise.resolve({ id: "task-12" }) }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(updateTaskForCurrentTenant).toHaveBeenCalledWith("task-12", {
      status: "Complete",
      owner: "Trust officer",
      dueDate: "2026-05-07",
      decisionNeeded: "Board packet approved"
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/tasks");
  });

  it("returns 400 for an invalid task update payload", async () => {
    const { PATCH } = await import("@/app/api/tasks/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/tasks/task-12", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Done",
          owner: ""
        })
      }),
      { params: Promise.resolve({ id: "task-12" }) }
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid task update payload."
    });
    expect(updateTaskForCurrentTenant).not.toHaveBeenCalled();
  });
});
