import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { updateTaskForCurrentTenant } from "@/lib/server/portfolio-service";

const updateTaskSchema = z.object({
  status: z.enum(["Open", "In progress", "Complete"]).optional(),
  owner: z.string().min(2).optional(),
  dueDate: z.string().min(8).optional(),
  decisionNeeded: z.string().min(3).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid task update payload." }, { status: 400 });
  }

  await updateTaskForCurrentTenant(id, parsed.data);
  revalidatePath("/");
  revalidatePath("/tasks");

  return NextResponse.json({ ok: true });
}
