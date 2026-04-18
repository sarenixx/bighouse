import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset } from "@/lib/server/portfolio-service";
import { formatDate } from "@/lib/utils";

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { dataset } = await getCurrentTenantDataset();
  const manager = dataset.managers.find((item) => item.id === id);
  const provider = dataset.providers.find((item) => item.id === id);

  if (!manager && !provider) notFound();

  const assignedProperties = dataset.properties.filter((property) =>
    manager ? manager.propertyIds.includes(property.id) : provider?.assignedPropertyIds.includes(property.id)
  );

  return (
    <AppShell
      title={manager?.name ?? provider?.name ?? "Provider detail"}
      subtitle={
        manager
          ? `${manager.region} property manager · ${manager.status} service posture`
          : `${provider?.type} · ${provider?.status} review posture`
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {manager ? (
              <>
                <div>Current score: <span className="font-medium text-foreground">{manager.score}</span></div>
                <div>Last reviewed: <span className="font-medium text-foreground">{formatDate(manager.lastReviewDate)}</span></div>
                <div>Issue count: <span className="font-medium text-foreground">{manager.issueCount}</span></div>
                <div>{manager.feePosition}</div>
              </>
            ) : (
              <>
                <div>Last reviewed: <span className="font-medium text-foreground">{provider && formatDate(provider.lastReviewed)}</span></div>
                <div>Contract renewal: <span className="font-medium text-foreground">{provider && formatDate(provider.contractRenewalDate)}</span></div>
                <div>{provider?.flaggedConcerns}</div>
                <div>{provider?.feeNotes}</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignedProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.slug}`} className="block rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white">
                <div className="font-medium text-foreground">{property.name}</div>
                <div className="text-sm text-muted-foreground">
                  {property.city}, {property.state} · {property.type}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
