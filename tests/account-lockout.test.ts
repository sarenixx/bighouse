import { describe, expect, it } from "vitest";

import {
  ACCOUNT_LOCKOUT_MS,
  getNextFailedLoginState,
  getUnlockedLoginState,
  isAccountLocked,
  MAX_FAILED_LOGIN_ATTEMPTS
} from "@/lib/server/account-lockout";

describe("account lockout policy", () => {
  it("does not lock the account before the threshold is reached", () => {
    const result = getNextFailedLoginState(MAX_FAILED_LOGIN_ATTEMPTS - 2, 1_700_000_000_000);

    expect(result.failedLoginCount).toBe(MAX_FAILED_LOGIN_ATTEMPTS - 1);
    expect(result.lockedUntil).toBeNull();
  });

  it("locks the account when the threshold is reached", () => {
    const now = 1_700_000_000_000;
    const result = getNextFailedLoginState(MAX_FAILED_LOGIN_ATTEMPTS - 1, now);

    expect(result.failedLoginCount).toBe(MAX_FAILED_LOGIN_ATTEMPTS);
    expect(result.lockedUntil?.getTime()).toBe(now + ACCOUNT_LOCKOUT_MS);
    expect(isAccountLocked(result.lockedUntil, now)).toBe(true);
  });

  it("returns the cleared state after a successful login", () => {
    expect(getUnlockedLoginState()).toEqual({
      failedLoginCount: 0,
      lockedUntil: null
    });
  });
});
