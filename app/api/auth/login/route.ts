import { NextResponse } from "next/server";
import { z } from "zod";

import { signIn } from "@/lib/server/auth";
import {
  buildLoginRateLimitKey,
  clearLoginRateLimit,
  consumeLoginRateLimit,
  getRequestClientIp
} from "@/lib/server/login-rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);
  const rateLimitKey = buildLoginRateLimitKey({
    ip: getRequestClientIp(request),
    email: parsed.success ? parsed.data.email : undefined
  });
  const rateLimit = await consumeLoginRateLimit(rateLimitKey);
  const headers = {
    "Retry-After": String(rateLimit.retryAfterSeconds),
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining)
  };

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a few minutes and try again." },
      { status: 429, headers }
    );
  }

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email and access code." },
      { status: 400, headers }
    );
  }

  const result = await signIn(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401, headers });
  }

  await clearLoginRateLimit(rateLimitKey);

  return NextResponse.json(
    { ok: true, user: result.user },
    {
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.limit)
      }
    }
  );
}
