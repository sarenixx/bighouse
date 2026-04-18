import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/server/prisma";
import { verifyPassword } from "@/lib/server/password";
import {
  getNextFailedLoginState,
  getUnlockedLoginState,
  isAccountLocked
} from "@/lib/server/account-lockout";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bh_session";

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  });

  if (!user) {
    return { ok: false as const, error: "Invalid email or access code." };
  }

  if (isAccountLocked(user.lockedUntil)) {
    return {
      ok: false as const,
      error: "Account temporarily locked after repeated sign-in failures. Please wait 15 minutes and try again."
    };
  }

  const shouldResetExpiredLock = Boolean(user.lockedUntil && !isAccountLocked(user.lockedUntil));
  const currentFailedLoginCount = shouldResetExpiredLock ? 0 : user.failedLoginCount;

  if (shouldResetExpiredLock) {
    await prisma.user.update({
      where: { id: user.id },
      data: getUnlockedLoginState()
    });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    const nextState = getNextFailedLoginState(currentFailedLoginCount);

    await prisma.user.update({
      where: { id: user.id },
      data: nextState
    });

    return {
      ok: false as const,
      error: nextState.lockedUntil
        ? "Account temporarily locked after repeated sign-in failures. Please wait 15 minutes and try again."
        : "Invalid email or access code."
    };
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.user.update({
    where: { id: user.id },
    data: getUnlockedLoginState()
  });

  await prisma.session.create({
    data: {
      id: `session-${token}`,
      token,
      tenantId: user.tenantId,
      userId: user.id,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });

  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name
    }
  };
}

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true, tenant: true }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { token } });
    }
    return null;
  }

  return {
    id: session.id,
    tenantId: session.tenantId,
    tenantName: session.tenant.name,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role
    }
  };
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
