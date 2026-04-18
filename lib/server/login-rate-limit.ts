import { clearRateLimit, consumeRateLimit } from "@/lib/server/rate-limit-store";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOGIN_RATE_LIMIT_NAMESPACE = "login";

export function getRequestClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return realIp?.trim() || "unknown";
}

export function buildLoginRateLimitKey(input: { ip: string; email?: string }) {
  const normalizedEmail = input.email?.trim().toLowerCase() || "anonymous";
  return `${input.ip}:${normalizedEmail}`;
}

export function consumeLoginRateLimit(key: string, now = Date.now()) {
  return consumeRateLimit({
    namespace: LOGIN_RATE_LIMIT_NAMESPACE,
    key,
    limit: MAX_ATTEMPTS,
    windowMs: WINDOW_MS,
    now
  });
}

export function clearLoginRateLimit(key: string) {
  return clearRateLimit({
    namespace: LOGIN_RATE_LIMIT_NAMESPACE,
    key
  });
}
