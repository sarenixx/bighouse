import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { consumeApiRateLimit } from "@/lib/server/api-rate-limit";
import { getRequestClientIp } from "@/lib/server/login-rate-limit";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bh_session";

const publicPaths = ["/login", "/api/auth/login"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const rateLimit = await consumeApiRateLimit({
      pathname,
      ip: getRequestClientIp(request)
    });

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining)
          }
        }
      );
    }
  }

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images");

  const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"]
};
