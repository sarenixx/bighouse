import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/server/app-route-error";
import { createDocumentForCurrentTenant } from "@/lib/server/portfolio-service";

const categorySchema = z.enum([
  "Property Manager Report",
  "Financial Statement",
  "Lease",
  "Lender Doc",
  "Tax Doc",
  "Insurance Doc",
  "Inspection Report",
  "Trustee Memo"
]);

const statusSchema = z.enum(["Current", "Needs review", "Awaiting upload"]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const category = categorySchema.safeParse(formData.get("category"));
    const status = statusSchema.safeParse(formData.get("status"));
    const title = String(formData.get("title") ?? "");
    const source = String(formData.get("source") ?? "");
    const propertyId = String(formData.get("propertyId") ?? "").trim();
    const fileCandidate = formData.get("file");

    if (!category.success || !status.success || title.length < 3 || source.length < 2) {
      return NextResponse.json({ error: "Invalid document payload." }, { status: 400 });
    }

    const file =
      fileCandidate instanceof File && fileCandidate.size > 0 ? fileCandidate : undefined;

    await createDocumentForCurrentTenant({
      propertyId: propertyId || undefined,
      category: category.data,
      title,
      status: status.data,
      source,
      file
    });

    revalidatePath("/documents");
    revalidatePath("/properties");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
