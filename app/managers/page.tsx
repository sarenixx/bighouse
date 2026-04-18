import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset } from "@/lib/server/portfolio-service";
import { formatDate } from "@/lib/utils";

export default async function ManagersPage() {
  const { dataset } = await getCurrentTenantDataset();

  return (
    <AppShell
      title="Managers & Vendors"
      subtitle="A directory of property managers and external specialists with oversight status, renewal timing, and review posture."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property managers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataset.managers.map((manager) => (
              <Link key={manager.id} href={`/managers/${manager.id}`} className="block rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{manager.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {manager.region} · {manager.propertyIds.length} assigned properties
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">{manager.score}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{manager.status}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{manager.feePosition}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External providers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataset.providers.map((provider) => (
              <Link key={provider.id} href={`/managers/${provider.id}`} className="block rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-foreground">{provider.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {provider.type} · {provider.assignedPropertyIds.length} assigned assets
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{provider.status}</div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Reviewed {formatDate(provider.lastReviewed)} · renewal {formatDate(provider.contractRenewalDate)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{provider.flaggedConcerns}</div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Provider oversight matrix</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="pb-4">Provider</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Assigned properties</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Last reviewed</th>
                  <th className="pb-4">Flagged concerns</th>
                  <th className="pb-4">Fee notes</th>
                  <th className="pb-4">Renewal date</th>
                </tr>
              </thead>
              <tbody>
                {dataset.providers.map((provider) => (
                  <tr key={provider.id} className="border-t border-border/60">
                    <td className="py-4 pr-4 font-medium text-foreground">{provider.name}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{provider.type}</td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      {provider.assignedPropertyIds
                        .map((propertyId) => dataset.properties.find((property) => property.id === propertyId)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">{provider.status}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{formatDate(provider.lastReviewed)}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{provider.flaggedConcerns}</td>
                    <td className="py-4 pr-4 text-muted-foreground">{provider.feeNotes}</td>
                    <td className="py-4 text-muted-foreground">{formatDate(provider.contractRenewalDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
