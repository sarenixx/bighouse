export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000;

export function isAccountLocked(lockedUntil: Date | null | undefined, now = Date.now()) {
  return Boolean(lockedUntil && lockedUntil.getTime() > now);
}

export function getNextFailedLoginState(
  failedLoginCount: number,
  now = Date.now()
) {
  const nextCount = failedLoginCount + 1;
  const shouldLock = nextCount >= MAX_FAILED_LOGIN_ATTEMPTS;

  return {
    failedLoginCount: nextCount,
    lockedUntil: shouldLock ? new Date(now + ACCOUNT_LOCKOUT_MS) : null
  };
}

export function getUnlockedLoginState() {
  return {
    failedLoginCount: 0,
    lockedUntil: null
  };
}
