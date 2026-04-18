import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/server/auth";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    session
  });
}
