import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { getRequestClientIp } from "@/lib/server/login-rate-limit";
import { getPrisma } from "@/lib/server/prisma";
import { consumeRateLimit } from "@/lib/server/rate-limit-store";

const WAITLIST_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const WAITLIST_RATE_LIMIT_MAX_ATTEMPTS = 8;
const WAITLIST_RATE_LIMIT_NAMESPACE = "waitlist";

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  source: z.string().trim().min(2).max(80).optional()
});

function getNormalizedEmail(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const email = (payload as { email?: unknown }).email;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
}

function buildRateLimitHeaders(rateLimit: {
  retryAfterSeconds: number;
  limit: number;
  remaining: number;
}) {
  return {
    "Retry-After": String(rateLimit.retryAfterSeconds),
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining)
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const normalizedEmail = getNormalizedEmail(payload);
  const rateLimitKey = `${getRequestClientIp(request)}:${normalizedEmail || "anonymous"}`;
  const rateLimit = await consumeRateLimit({
    namespace: WAITLIST_RATE_LIMIT_NAMESPACE,
    key: rateLimitKey,
    limit: WAITLIST_RATE_LIMIT_MAX_ATTEMPTS,
    windowMs: WAITLIST_RATE_LIMIT_WINDOW_MS
  });
  const headers = buildRateLimitHeaders(rateLimit);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many waitlist attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  const parsed = waitlistSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400, headers }
    );
  }

  const prisma = await getPrisma();
  const entryData = {
    id: `waitlist-${crypto.randomUUID()}`,
    email: parsed.data.email,
    source: parsed.data.source ?? "landing-page",
    status: "pending"
  } as const;

  try {
    await prisma.waitlistEntry.create({ data: entryData });

    return NextResponse.json(
      { ok: true, message: "You are on the waitlist. We will reach out soon." },
      { status: 201, headers }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: true, message: "You are already on the waitlist." },
        { headers }
      );
    }

    console.error("waitlist_signup_failed", error);
    return NextResponse.json(
      { error: "Unable to join the waitlist right now. Please try again." },
      { status: 500, headers }
    );
  }
}
