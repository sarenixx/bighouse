import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bh_session";

const publicPaths = [
  "/",
  "/login",
  "/privacy",
  "/terms",
  "/api/auth/login",
  "/api/waitlist",
  "/amseta-example-report-card.pdf"
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
