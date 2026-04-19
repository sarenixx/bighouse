import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PortfolioOverviewContent } from "@/components/portfolio-overview-content";
import { Button } from "@/components/ui/button";
import { getCurrentTenantDataset, getPortfolioChart, getPortfolioSummary } from "@/lib/server/portfolio-service";

export default async function DashboardPage() {
  const { dataset } = await getCurrentTenantDataset();
  const portfolioSummary = getPortfolioSummary(dataset);
  const portfolioChart = getPortfolioChart(dataset);
  const topIssues = [...dataset.issues]
    .sort((a, b) => (a.severity === "critical" ? -1 : 1) - (b.severity === "critical" ? -1 : 1))
    .slice(0, 5);
  const watchlist = dataset.issues.filter((issue) => issue.status === "Watching").slice(0, 4);
  const upcomingTasks = [...dataset.tasks]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);
  const marketRollup = Object.values(
    dataset.properties.reduce<
      Record<string, { market: string; properties: number; units: number; avgOccupancy: number }>
    >((acc, property) => {
      acc[property.market] ??= {
        market: property.market,
        properties: 0,
        units: 0,
        avgOccupancy: 0
      };
      acc[property.market].properties += 1;
      acc[property.market].units += property.unitCount;
      acc[property.market].avgOccupancy += property.occupancy;
      return acc;
    }, {})
  ).map((entry) => ({
    ...entry,
    avgOccupancy: entry.avgOccupancy / entry.properties
  }));

  return (
    <AppShell
      title="Portfolio Overview"
      subtitle="Executive oversight across managers, lenders, and specialists. Focus on risk, accountability, and the decisions that need owner attention now."
      action={
        <Button asChild variant="secondary">
          <Link href="/reporting/trustee-report">
            Generate trustee brief
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <PortfolioOverviewContent
        dataset={dataset}
        portfolioChart={portfolioChart}
        portfolioSummary={portfolioSummary}
        topIssues={topIssues}
        watchlist={watchlist}
        upcomingTasks={upcomingTasks}
        marketRollup={marketRollup}
      />
    </AppShell>
  );
}
