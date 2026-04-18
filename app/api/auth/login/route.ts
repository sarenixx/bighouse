import { NextResponse } from "next/server";
import { z } from "zod";

import { signIn } from "@/lib/server/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email and access code." }, { status: 400 });
  }

  const result = await signIn(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
