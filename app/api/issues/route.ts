import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/server/app-route-error";
import { createIssueForCurrentTenant } from "@/lib/server/portfolio-service";

const createIssueSchema = z.object({
  propertyId: z.string().min(1),
  propertySlug: z.string().min(1).optional(),
  title: z.string().min(3),
  detail: z.string().min(8),
  severity: z.enum(["low", "moderate", "elevated", "critical"]),
  category: z.enum(["vacancy", "capex", "fees", "reporting", "debt", "leasing"]),
  owner: z.string().min(2),
  dueDate: z.string().min(8),
  status: z.enum(["Open", "Watching", "Escalated"]).default("Open")
});

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = createIssueSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid issue payload." }, { status: 400 });
    }

    await createIssueForCurrentTenant(parsed.data);
    revalidatePath("/");
    revalidatePath("/properties");

    if (parsed.data.propertySlug) {
      revalidatePath(`/properties/${parsed.data.propertySlug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
