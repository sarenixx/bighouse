import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

describe("proxy", () => {
  it("redirects anonymous protected-page requests to login with a from parameter", async () => {
    const { middleware } = await import("@/middleware");

    const response = await middleware(new NextRequest("http://localhost/tasks?view=open"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?from=%2Ftasks%3Fview%3Dopen");
  });

  it("allows the login page through even when a stale session cookie is present", async () => {
    const { middleware } = await import("@/middleware");

    const response = await middleware(
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
