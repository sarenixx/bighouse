import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/server/auth";
import { getTenantDataset, getPropertyBySlug, getPropertyContext } from "@/lib/server/portfolio-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dataset = await getTenantDataset(session.tenantId);
  const property = getPropertyBySlug(dataset, slug);

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({
    tenant: {
      id: session.tenantId,
      name: session.tenantName
    },
    property,
    context: getPropertyContext(dataset, property.id)
  });
}
