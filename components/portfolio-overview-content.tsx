import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ClipboardList,
  MapPinned,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { BudgetComparisonChart, OccupancyChart, PerformanceChart } from "@/components/charts";
import { DemoJourney } from "@/components/demo-journey";
import { IssueCreateForm } from "@/components/issue-create-form";
import { IssueStatusControl } from "@/components/issue-status-control";
import { ToneBadge } from "@/components/status-chip";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PortfolioScoreboard } from "@/lib/dashboard-scoreboard";
import type { PortfolioDataset } from "@/lib/types";
import { formatCompactCurrency, formatCurrency, formatDate, formatPercent } from "@/lib/utils";
import { RiskBadge } from "@/components/status-chip";

export function PortfolioOverviewContent({
  dataset,
  scoreboard,
  portfolioChart,
  portfolioSummary,
  topIssues,
  watchlist,
  upcomingTasks,
  marketRollup
}: {
  dataset: PortfolioDataset;
  scoreboard: PortfolioScoreboard;
  portfolioChart: Array<{
    month: string;
    performance: number;
    occupancy: number;
    collected: number;
    budget: number;
  }>;
  portfolioSummary: {
    totalProperties: number;
    totalUnits: number;
    occupancyRate: number;
    grossMonthlyRent: number;
    netOperatingIncome: number;
    criticalIssues: number;
    upcomingRenewals: number;
    activeCapexProjects: number;
  };
  topIssues: PortfolioDataset["issues"];
  watchlist: PortfolioDataset["issues"];
  upcomingTasks: PortfolioDataset["tasks"];
  marketRollup: Array<{ market: string; properties: number; units: number; avgOccupancy: number }>;
}) {
  const propertiesNeedingAttention = scoreboard.propertyReports.filter(
    (report) => report.healthTone !== "good"
  ).length;
  const activeDiagnostics = scoreboard.diagnostics.filter(
    (diagnostic) => diagnostic.tone !== "good"
  ).length;
  const immediateServices = scoreboard.services.filter(
    (service) => service.urgency === "Immediate"
  ).length;

  return (
    <div className="space-y-6">
      <DemoJourney />

      <Card className="overflow-hidden border-primary/15 bg-primary text-primary-foreground">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">
              Portfolio Scoreboard
            </div>
            <div className="font-serif text-3xl leading-tight">
              Health score {scoreboard.portfolioHealthScore} · {scoreboard.healthBand} operating posture
            </div>
            <p className="max-w-3xl text-sm text-primary-foreground/78">{scoreboard.performanceSummary}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Management agreements
              </div>
              <div className="mt-2 text-2xl font-semibold">{scoreboard.managementAgreements}</div>
              <div className="mt-1 text-sm text-primary-foreground/75">Current property-manager coverage</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Funds from operations
              </div>
              <div className="mt-2 text-2xl font-semibold">{formatCompactCurrency(scoreboard.fundsFromOperations)}</div>
              <div className="mt-1 text-sm text-primary-foreground/75">Modeled annualized FFO run-rate</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                Same-store performance
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {scoreboard.sameStorePerformance >= 0 ? "+" : ""}
                {scoreboard.sameStorePerformance.toFixed(1)}%
              </div>
              <div className="mt-1 text-sm text-primary-foreground/75">Portfolio-wide modeled same-store change</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 bg-gradient-to-br from-white via-white to-secondary/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Metrics
              </div>
            </div>
            <div className="text-xl font-semibold text-foreground">Portfolio and property data layer</div>
            <div className="text-sm text-muted-foreground">
              KPIs, FFO, same-store performance, trailing NOI, receivables, payables, and MOR rollups stay together here.
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {scoreboard.managementAgreements} management agreements
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {formatCompactCurrency(scoreboard.trailingTwelveNoi)} TTM NOI
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {formatCompactCurrency(scoreboard.totalReceivablesExposure)} AR exposure
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-to-br from-white via-white to-secondary/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Diagnostics
              </div>
            </div>
            <div className="text-xl font-semibold text-foreground">Insights and exception review</div>
            <div className="text-sm text-muted-foreground">
              Score drivers, duplicate invoice screens, lease or CAM compliance notes, and variance follow-up live here.
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {propertiesNeedingAttention} properties need attention
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {activeDiagnostics} active portfolio diagnostics
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {scoreboard.expenseCategories.length} expense categories under review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-gradient-to-br from-white via-white to-secondary/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Services
              </div>
            </div>
            <div className="text-xl font-semibold text-foreground">Interventions and accountability</div>
            <div className="text-sm text-muted-foreground">
              Operational reviews, financial interventions, and stakeholder ownership are separated from the raw metrics.
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {immediateServices} immediate interventions
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {scoreboard.services.length} prioritized service actions
              </div>
              <div className="rounded-[1rem] border border-border/60 bg-background/80 p-3 text-sm">
                {scoreboard.contacts.length} property accountability cards
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total properties" value={`${portfolioSummary.totalProperties}`} detail="Active assets" />
        <StatCard label="Total units" value={`${portfolioSummary.totalUnits}`} detail="Units and suites" />
        <StatCard
          label="Portfolio health"
          value={`${scoreboard.portfolioHealthScore}`}
          delta={scoreboard.healthBand}
          tone={scoreboard.portfolioHealthScore >= 82 ? "good" : scoreboard.portfolioHealthScore >= 70 ? "watch" : "alert"}
        />
        <StatCard
          label="Occupancy rate"
          value={formatPercent(portfolioSummary.occupancyRate)}
          delta="+0.8 pts vs Q4"
          tone="good"
        />
        <StatCard
          label="Gross monthly rent"
          value={formatCompactCurrency(portfolioSummary.grossMonthlyRent)}
          detail="Portfolio-wide"
        />
        <StatCard
          label="Funds From Operations"
          value={formatCompactCurrency(scoreboard.fundsFromOperations)}
          detail="Modeled annualized"
        />
        <StatCard
          label="Same-store performance"
          value={`${scoreboard.sameStorePerformance >= 0 ? "+" : ""}${scoreboard.sameStorePerformance.toFixed(1)}%`}
          tone={scoreboard.sameStorePerformance >= 1 ? "good" : scoreboard.sameStorePerformance >= -1 ? "watch" : "alert"}
        />
        <StatCard
          label="Trailing 12-month NOI"
          value={formatCompactCurrency(scoreboard.trailingTwelveNoi)}
          detail="Annualized run-rate"
        />
        <StatCard
          label="Aged receivables"
          value={formatCompactCurrency(scoreboard.totalReceivablesExposure)}
          tone={scoreboard.totalReceivablesExposure > 400000 ? "alert" : "watch"}
          detail="Modeled exposure"
        />
        <StatCard
          label="Aged payables"
          value={formatCompactCurrency(scoreboard.totalPayablesExposure)}
          tone={scoreboard.totalPayablesExposure > 500000 ? "alert" : "watch"}
          detail="Modeled exposure"
        />
        <StatCard
          label="Critical issues"
          value={`${portfolioSummary.criticalIssues}`}
          delta="Escalation watch"
          tone="alert"
        />
        <StatCard
          label="Renewals / maturities"
          value={`${portfolioSummary.upcomingRenewals}`}
          detail="Next 12 months"
          tone="watch"
        />
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio performance summary</CardTitle>
                <CardDescription>
                  Modeled scoreboard metrics that roll same-store performance, NOI strength, and management agreement coverage into one operating view.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Health score summary</div>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="text-4xl font-semibold text-primary">{scoreboard.portfolioHealthScore}</div>
                    <ToneBadge
                      tone={
                        scoreboard.portfolioHealthScore >= 82
                          ? "good"
                          : scoreboard.portfolioHealthScore >= 70
                            ? "watch"
                            : "alert"
                      }
                    />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{scoreboard.performanceSummary}</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="text-sm font-medium text-foreground">Same-store performance</div>
                    <div className="mt-2 text-2xl font-semibold text-primary">
                      {scoreboard.sameStorePerformance >= 0 ? "+" : ""}
                      {scoreboard.sameStorePerformance.toFixed(1)}%
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Average property-level same-store trend across the current reporting base.
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="text-sm font-medium text-foreground">Management agreements</div>
                    <div className="mt-2 text-2xl font-semibold text-primary">{scoreboard.managementAgreements}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Active property-management oversight relationships.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property health score directory</CardTitle>
                <CardDescription>
                  Credit-report-style property health scoring built from NOI, vacancy, receivables, payables, expense discipline, and lease stability.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.propertyReports.map((report) => {
                  const weakestFactor = [...report.factors].sort((a, b) => a.score - b.score)[0];
                  return (
                    <Link
                      key={report.propertyId}
                      href={`/properties/${report.propertySlug}`}
                      className="block rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="font-medium text-foreground">{report.propertyName}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.market} · {report.managementAgreementLabel}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">{report.healthSummary}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {report.factors.slice(0, 3).map((factor) => (
                              <span
                                key={`${report.propertyId}-${factor.key}`}
                                className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted-foreground"
                              >
                                {factor.label}: {factor.score}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-semibold text-primary">{report.healthScore}</div>
                          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            {report.healthBand}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Weakest factor: {weakestFactor.label}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Same-store: {report.sameStorePerformance >= 0 ? "+" : ""}
                            {report.sameStorePerformance.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-4">
            <StatCard label="FFO (modeled)" value={formatCompactCurrency(scoreboard.fundsFromOperations)} detail="Annualized" />
            <StatCard label="TTM NOI run-rate" value={formatCompactCurrency(scoreboard.trailingTwelveNoi)} detail="Annualized" />
            <StatCard label="Receivables exposure" value={formatCompactCurrency(scoreboard.totalReceivablesExposure)} tone="watch" />
            <StatCard label="Payables exposure" value={formatCompactCurrency(scoreboard.totalPayablesExposure)} tone="watch" />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Monthly operating report rollup</CardTitle>
                <CardDescription>
                  Portfolio-level MOR view across NOI, vacancy, receivables, payables, and general-ledger behavior.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-sm font-medium text-foreground">NOI</div>
                  <div className="mt-2 text-2xl font-semibold text-primary">
                    {formatCompactCurrency(scoreboard.trailingTwelveNoi / 12)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Average monthly portfolio NOI</div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-sm font-medium text-foreground">Vacancy</div>
                  <div className="mt-2 text-2xl font-semibold text-primary">
                    {formatPercent(100 - portfolioSummary.occupancyRate)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Current vacancy proxy</div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-sm font-medium text-foreground">Aged receivables</div>
                  <div className="mt-2 text-2xl font-semibold text-primary">
                    {formatCompactCurrency(scoreboard.totalReceivablesExposure)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Modeled delinquency exposure</div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-sm font-medium text-foreground">Aged payables</div>
                  <div className="mt-2 text-2xl font-semibold text-primary">
                    {formatCompactCurrency(scoreboard.totalPayablesExposure)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Modeled payable stack</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense category review</CardTitle>
                <CardDescription>
                  General-ledger style review of category drift, quarter-close concerns, and invoice scrutiny targets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.expenseCategories.map((category) => (
                  <div key={category.category} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{category.category}</div>
                      <ToneBadge tone={category.tone} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Current {formatCurrency(category.current)} · prior month {formatCurrency(category.priorMonth)} · variance{" "}
                      {category.variancePercent >= 0 ? "+" : ""}
                      {category.variancePercent.toFixed(1)}%
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{category.review}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio diagnostics</CardTitle>
                <CardDescription>
                  Separate insights from raw metrics so the review layer highlights what actually needs follow-up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.diagnostics.map((diagnostic) => (
                  <div key={diagnostic.title} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{diagnostic.title}</div>
                      <ToneBadge tone={diagnostic.tone} />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{diagnostic.detail}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {diagnostic.timeframe}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property-level diagnostic exceptions</CardTitle>
                <CardDescription>
                  Invoice review, quarter-close variance, and trailing trend exceptions by property.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.propertyReports.map((report) => (
                  <div key={report.propertyId} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="font-medium text-foreground">{report.propertyName}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Prior month {report.diagnostics.priorMonthChange >= 0 ? "+" : ""}
                          {report.diagnostics.priorMonthChange.toFixed(1)}% · quarter{" "}
                          {report.diagnostics.quarterlyChange >= 0 ? "+" : ""}
                          {report.diagnostics.quarterlyChange.toFixed(1)}% · trailing{" "}
                          {report.diagnostics.trailingTwelveChange >= 0 ? "+" : ""}
                          {report.diagnostics.trailingTwelveChange.toFixed(1)}%
                        </div>
                      </div>
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/properties/${report.propertySlug}`}>
                          Open diagnostics
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {report.diagnostics.findings.slice(0, 2).map((finding) => (
                        <div key={finding.title} className="rounded-[1rem] border border-border/60 bg-background/70 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-foreground">{finding.title}</div>
                            <ToneBadge tone={finding.tone} />
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">{finding.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Advanced services and interventions</CardTitle>
                <CardDescription>
                  Separate action modules from diagnostics so the owner can see what to do next, not just what is wrong.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.services.map((service) => (
                  <div key={`${service.title}-${service.detail}`} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{service.title}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {service.urgency}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{service.detail}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Owner: {service.owner}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact and oversight layer</CardTitle>
                <CardDescription>
                  Property-level accountability matrix showing who owns fiduciary, oversight, and manager follow-through.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {scoreboard.contacts.map((contact) => (
                  <div key={contact.propertyId} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {contact.propertyName}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-[1rem] border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Fiduciary</div>
                        <div className="mt-1 text-sm font-medium text-foreground">{contact.fiduciary}</div>
                      </div>
                      <div className="rounded-[1rem] border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Asset lead</div>
                        <div className="mt-1 text-sm font-medium text-foreground">{contact.assetLead}</div>
                      </div>
                      <div className="rounded-[1rem] border border-border/60 bg-background/70 p-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Property manager</div>
                        <div className="mt-1 text-sm font-medium text-foreground">{contact.propertyManager}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Oversight design principles</CardTitle>
              <CardDescription>
                Keep the dashboard honest about the difference between what is happening, why it matters, and what services should be deployed next.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  Metrics
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  KPIs, NOI, vacancy, FFO, same-store, TTM, receivables, payables, and management agreement counts stay in one structured scorecard layer.
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  Diagnostics
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  GL analysis, duplicate invoice screening, expense fluctuation checks, AP/AR reviews, and lease oversight live separately from the raw KPI layer.
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Services
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Disposition planning, contract review, wind-down readiness, and specialized intervention recommendations stay visible as explicit action modules.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
