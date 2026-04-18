type RateLimitPolicy = {
  key: string;
  limit: number;
  windowMs: number;
};

import { consumeRateLimit } from "@/lib/server/rate-limit-store";

export function getApiRateLimitPolicy(pathname: string): RateLimitPolicy {
  if (pathname === "/api/auth/login") {
    return { key: "auth-login", limit: 20, windowMs: 5 * 60 * 1000 };
  }

  if (pathname.startsWith("/api/reports/")) {
    return { key: "reports", limit: 30, windowMs: 5 * 60 * 1000 };
  }

  if (pathname.startsWith("/api/")) {
    return { key: "api-default", limit: 120, windowMs: 60 * 1000 };
  }

  return { key: "default", limit: 240, windowMs: 60 * 1000 };
}

export function consumeApiRateLimit(input: {
  pathname: string;
  ip: string;
  now?: number;
}) {
  const policy = getApiRateLimitPolicy(input.pathname);

  return consumeRateLimit({
    namespace: "api",
    key: `${policy.key}:${input.ip}`,
    limit: policy.limit,
    windowMs: policy.windowMs,
    now: input.now
  });
}
