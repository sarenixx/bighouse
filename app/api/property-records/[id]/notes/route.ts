import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createTimelineNoteForCurrentTenant } from "@/lib/server/portfolio-service";

const schema = z.object({
  author: z.string().min(2),
  label: z.string().min(2),
  note: z.string().min(8)
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid note payload." }, { status: 400 });
  }

  await createTimelineNoteForCurrentTenant({
    propertyId: id,
    ...parsed.data
  });

  revalidatePath("/properties");
  return NextResponse.json({ ok: true });
}
