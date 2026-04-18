import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/server/auth";
import { getReport } from "@/lib/report-library";
import { renderReportPdf } from "@/lib/report-pdf";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const report = getReport(slug);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const pdf = await renderReportPdf(report);
  const bytes = new Uint8Array(pdf);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.slug}.pdf"`,
      "Cache-Control": "no-store"
    }
  });
}
