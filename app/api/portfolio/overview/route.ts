import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/server/auth";
import { getPortfolioChart, getPortfolioSummary, getTenantDataset } from "@/lib/server/portfolio-service";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = await getTenantDataset(session.tenantId);

  return NextResponse.json({
    tenant: {
      id: session.tenantId,
      name: session.tenantName
    },
    summary: getPortfolioSummary(dataset),
    chart: getPortfolioChart(dataset),
    issues: dataset.issues,
    managers: dataset.managers
  });
}
