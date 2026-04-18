import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/server/app-route-error";
import { updateManagerReviewForCurrentTenant } from "@/lib/server/portfolio-service";

const schema = z.object({
  reviewerNotes: z.string().min(8).optional(),
  feeNotes: z.string().min(8).optional(),
  annualSiteVisitComplete: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid manager review update." }, { status: 400 });
    }

    await updateManagerReviewForCurrentTenant({
      propertyId: id,
      ...parsed.data
    });

    revalidatePath("/properties");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
