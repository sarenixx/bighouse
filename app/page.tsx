import Link from "next/link";
import { ArrowRight, CalendarClock, MapPinned } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BudgetComparisonChart, OccupancyChart, PerformanceChart } from "@/components/charts";
import { DemoJourney } from "@/components/demo-journey";
import { IssueCreateForm } from "@/components/issue-create-form";
import { IssueStatusControl } from "@/components/issue-status-control";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset, getPortfolioChart, getPortfolioSummary } from "@/lib/server/portfolio-service";
import { formatCompactCurrency, formatDate, formatPercent } from "@/lib/utils";
import { RiskBadge } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";

export default async function HomePage() {
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
      <div className="space-y-6">
        <DemoJourney />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total properties" value={`${portfolioSummary.totalProperties}`} detail="12 active assets" />
          <StatCard label="Total units" value={`${portfolioSummary.totalUnits}`} detail="Mixed property types" />
          <StatCard label="Occupancy rate" value={formatPercent(portfolioSummary.occupancyRate)} delta="+0.8 pts vs Q4" tone="good" />
          <StatCard label="Gross monthly rent" value={formatCompactCurrency(portfolioSummary.grossMonthlyRent)} detail="Portfolio-wide" />
          <StatCard label="Net operating income" value={formatCompactCurrency(portfolioSummary.netOperatingIncome)} delta="+2.4% vs plan" tone="good" />
          <StatCard label="Critical issues" value={`${portfolioSummary.criticalIssues}`} delta="2 escalated today" tone="alert" />
          <StatCard label="Renewals / maturities" value={`${portfolioSummary.upcomingRenewals}`} detail="Next 12 months" tone="watch" />
          <StatCard label="Active capex projects" value={`${portfolioSummary.activeCapexProjects}`} detail="2 need decisions" tone="watch" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PerformanceChart
                data={portfolioChart}
                title="Portfolio performance trend"
                description="Composite oversight score blending occupancy, reporting quality, fee discipline, and issue response."
              />
              <OccupancyChart
                data={portfolioChart}
                title="Occupancy trend"
                description="Average occupancy across all assets, smoothing differences across residential and commercial property types."
              />
            </div>
            <BudgetComparisonChart
              data={portfolioChart}
              title="Rent collected vs budget"
              description="Monthly rent receipts compared with approved portfolio budget expectations."
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle>Hot Sheet</CardTitle>
                    <CardDescription>Most urgent issues requiring owner or trustee attention.</CardDescription>
                  </div>
                  <IssueCreateForm properties={dataset.properties} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {topIssues.map((issue) => {
                  const property = dataset.properties.find((item) => item.id === issue.propertyId);
                  return (
                    <div key={issue.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/properties/${property?.slug}`} className="block flex-1 transition hover:opacity-90">
                          <div className="text-sm font-medium text-foreground">{issue.title}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{property?.name}</div>
                          <div className="mt-2 text-sm text-muted-foreground">{issue.detail}</div>
                        </Link>
                        <div className="flex flex-col items-end gap-2">
                          <RiskBadge risk={issue.severity} />
                          <IssueStatusControl issueId={issue.id} status={issue.status} />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        <span>{issue.owner}</span>
                        <span>Due {formatDate(issue.dueDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Yellow-flag items to monitor before they become exceptions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {watchlist.map((issue) => {
                  const property = dataset.properties.find((item) => item.id === issue.propertyId);
                  return (
                    <div key={issue.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-foreground">{issue.title}</div>
                          <div className="text-sm text-muted-foreground">{property?.name}</div>
                        </div>
                        <RiskBadge risk={issue.severity} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.95fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming calendar</CardTitle>
              <CardDescription>Monthly, quarterly, annual, and trustee review items across the portfolio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.map((task) => {
                const property = dataset.properties.find((item) => item.id === task.propertyId);
                return (
                  <div key={task.id} className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-foreground">{task.title}</div>
                          <div className="text-sm text-muted-foreground">{property?.name ?? "Portfolio-wide"}</div>
                        </div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{task.cadence}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{task.decisionNeeded}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manager performance snapshot</CardTitle>
              <CardDescription>High-level service quality across each property manager.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataset.managers.map((manager) => (
                <Link
                  key={manager.id}
                  href={`/managers/${manager.id}`}
                  className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white"
                >
                  <div>
                    <div className="font-medium text-foreground">{manager.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {manager.propertyIds.length} properties · reviewed {formatDate(manager.lastReviewDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-primary">{manager.score}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{manager.status}</div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic summary</CardTitle>
              <CardDescription>Where portfolio exposure and execution intensity are concentrated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketRollup.map((market) => (
                <div key={market.market} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-muted-foreground" />
                      <div className="font-medium text-foreground">{market.market}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatPercent(market.avgOccupancy)}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {market.properties} properties · {market.units} units or suites
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
