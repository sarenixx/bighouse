import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/server/app-route-error";
import { updateIssueForCurrentTenant } from "@/lib/server/portfolio-service";

const updateIssueSchema = z.object({
  status: z.enum(["Open", "Watching", "Escalated"]).optional(),
  severity: z.enum(["low", "moderate", "elevated", "critical"]).optional(),
  owner: z.string().min(2).optional(),
  dueDate: z.string().min(8).optional(),
  detail: z.string().min(8).optional(),
  title: z.string().min(3).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const parsed = updateIssueSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid issue update payload." }, { status: 400 });
    }

    await updateIssueForCurrentTenant(id, parsed.data);
    revalidatePath("/");
    revalidatePath("/properties");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
