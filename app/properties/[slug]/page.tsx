import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeDollarSign, Building2, FileText, Percent, ShieldCheck, TriangleAlert, Users2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { BudgetComparisonChart, OccupancyChart, PerformanceChart } from "@/components/charts";
import { DocumentUploadForm } from "@/components/document-upload-form";
import { ManagerReviewForm } from "@/components/manager-review-form";
import { PropertyNoteForm } from "@/components/property-note-form";
import { RiskBadge, StatusIcon, ToneBadge } from "@/components/status-chip";
import { StatCard } from "@/components/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset, getPropertyBySlug, getPropertyContext } from "@/lib/server/portfolio-service";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils";

const scorecardLabels = {
  reportingTimeliness: "Reporting timeliness",
  occupancyManagement: "Occupancy management",
  rentGrowthExecution: "Rent growth execution",
  turnTimeEfficiency: "Turn time efficiency",
  expenseDiscipline: "Expense discipline",
  capexExecution: "Capex execution",
  communicationQuality: "Communication quality",
  issueResolutionSpeed: "Issue resolution speed",
  feeFairness: "Fee fairness"
} as const;

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { dataset } = await getCurrentTenantDataset();
  const property = getPropertyBySlug(dataset, slug);

  if (!property) notFound();

  const manager = dataset.managers.find((item) => item.id === property.managerId);
  const propertyProviders = dataset.providers.filter((provider) => provider.assignedPropertyIds.includes(property.id));
  const context = getPropertyContext(dataset, property.id);

  return (
    <AppShell
      title={property.name}
      subtitle={`${property.city}, ${property.state} · ${property.type} · ${property.ownershipEntity}`}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <RiskBadge risk={property.risk} />
                <ToneBadge tone={property.managerReview.reportingTimeliness} />
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Last review {formatDate(property.lastReviewDate)}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Property manager</div>
                  <div className="mt-2 text-lg font-semibold text-primary">{manager?.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{manager?.status} service rating</div>
                </div>
                <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Debt status</div>
                  <div className="mt-2 text-lg font-semibold text-primary">{property.debtStatus}</div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard label="Occupancy" value={formatPercent(property.occupancy)} tone={property.occupancy > 94 ? "good" : "watch"} />
                <StatCard label="Leased %" value={formatPercent(property.leasedPercent)} />
                <StatCard label="Average rent" value={property.type === "Multifamily" ? formatCurrency(property.averageRent) : `$${property.averageRent}/SF`} />
                <StatCard label="Delinquencies" value={formatPercent(property.delinquencies)} tone={property.delinquencies > 1.8 ? "alert" : "neutral"} />
                <StatCard label="Turn time" value={`${property.turnTime} days`} tone={property.turnTime > 45 ? "alert" : property.turnTime > 30 ? "watch" : "good"} />
                <StatCard label="Admin costs" value={formatCurrency(property.adminCosts)} />
                <StatCard label="Budget vs actual" value={`${property.budgetVsActual.toFixed(1)}%`} tone={property.budgetVsActual < -3 ? "alert" : property.budgetVsActual < 0 ? "watch" : "good"} />
                <StatCard label="Capex progress" value={`${property.capexProgress}%`} />
                <StatCard label="Open issues" value={`${property.openIssues}`} tone={property.openIssues > 2 ? "alert" : property.openIssues > 0 ? "watch" : "good"} />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-primary p-6 text-primary-foreground shadow-soft">
              <div className="text-xs uppercase tracking-[0.22em] text-primary-foreground/70">Owner command center</div>
              <div className="mt-3 font-serif text-3xl">{property.summary}</div>
              <div className="mt-6 grid gap-4">
                {property.nextActions.map((action) => (
                  <div key={action} className="rounded-[1.25rem] border border-white/10 bg-white/10 p-4 text-sm">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="operations">Leasing / Operations</TabsTrigger>
            <TabsTrigger value="projects">Projects / Capex</TabsTrigger>
            <TabsTrigger value="manager">Manager Review</TabsTrigger>
            <TabsTrigger value="vendors">Vendors / Specialists</TabsTrigger>
            <TabsTrigger value="documents">Documents / Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Asset summary</CardTitle>
                <CardDescription>What an owner or trustee should know before the next review call.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Current status
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{property.summary}</p>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TriangleAlert className="h-4 w-4 text-muted-foreground" />
                    Key risks
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {property.keyRisks.map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    Next recommended actions
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {property.nextActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assigned service providers</CardTitle>
                <CardDescription>Third parties supporting this asset and the immediate coordination posture.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {propertyProviders.map((provider) => (
                  <Link
                    key={provider.id}
                    href={`/managers/${provider.id}`}
                    className="block rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{provider.name}</div>
                        <div className="text-sm text-muted-foreground">{provider.type}</div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{provider.status}</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{provider.nextAction}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <PerformanceChart data={property.performance} title="NOI trend" description="Month-over-month oversight view of operating income." />
              <BudgetComparisonChart data={property.performance} title="Budget vs actual revenue" description="Actual rent receipts versus approved monthly budget." />
              <OccupancyChart data={property.performance} title="Expense and cash flow context" description="Expense pressure often explains owner questions before NOI softens." />
            </div>
            <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Notable variances</CardTitle>
                  <CardDescription>Items most likely to deserve monthly owner review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="font-medium text-foreground">Budget vs actual</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Portfolio variance stands at {property.budgetVsActual.toFixed(1)}%. The main drivers are utility costs, admin charges, and slower-than-planned leasing on flagged assets.
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="font-medium text-foreground">Fee review</div>
                    <div className="mt-2 text-sm text-muted-foreground">{property.managerReview.feeNotes}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Refinance / debt status</CardTitle>
                  <CardDescription>Capital markets oversight for this asset.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">{property.debtStatus}</div>
                  <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                    Owner takeaway: {property.id === "prop-meridian" ? "Refinance path needs approval this month." : "No immediate debt intervention required."}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <OccupancyChart data={property.performance} title="Vacancy trend" description="Vacancy trajectory over the last ten reporting periods." />
              <PerformanceChart data={property.performance} title="Days-to-turn trend" description="Turn-time efficiency and whether make-ready execution is improving." />
              <BudgetComparisonChart data={property.performance} title="Collected rent trend" description="Collections reliability compared with budget assumptions." />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Leasing and operations summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    Rent increase tracking
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {property.risk === "elevated" || property.risk === "critical"
                      ? "Current growth is below peer set and should be challenged."
                      : "Growth cadence remains consistent with current market positioning."}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="font-medium text-foreground">Concessions</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {property.type === "Multifamily" ? "Concessions are targeted by floorplan and should remain temporary." : "Minimal concession use; monitor only for select lease-up situations."}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="font-medium text-foreground">Maintenance response</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Service response is {property.managerReview.issueResolutionSpeed === "good" ? "timely and controlled" : "adequate but should be pushed harder on exceptions"}.
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="font-medium text-foreground">Churn / renewals</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {property.renewalCount} renewal events are queued across the next 12 months.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Renovation and capex projects</CardTitle>
                <CardDescription>Highlight late projects, budget pressure, and where owner input is needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-x-auto">
                {context.projects.length ? (
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="pb-4">Project</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Budget</th>
                        <th className="pb-4">Actual</th>
                        <th className="pb-4">Variance</th>
                        <th className="pb-4">Timeline</th>
                        <th className="pb-4">Owner decision needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {context.projects.map((project) => (
                        <tr key={project.id} className="border-t border-border/60">
                          <td className="py-4 pr-4 font-medium text-foreground">{project.name}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{project.status}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{formatCurrency(project.budget)}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{formatCurrency(project.actual)}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{`${(((project.actual - project.budget) / project.budget) * 100).toFixed(1)}%`}</td>
                          <td className="py-4 pr-4 text-muted-foreground">{project.timeline}</td>
                          <td className="py-4 text-muted-foreground">{project.ownerDecision}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-border bg-white/60 p-8 text-sm text-muted-foreground">
                    No major capex program is active beyond routine reserves. Oversight remains focused on close-out discipline and fee normalization.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manager scorecard</CardTitle>
                <CardDescription>This is the core oversight layer: measure execution, not just reported activity.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(scorecardLabels).map(([key, label]) => {
                  const tone = property.managerReview[key as keyof typeof scorecardLabels];
                  return (
                    <div key={key} className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon tone={tone} />
                        <div className="font-medium text-foreground">{label}</div>
                      </div>
                      <ToneBadge tone={tone} />
                    </div>
                  );
                })}
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="font-medium text-foreground">Annual site visit</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {property.managerReview.annualSiteVisitComplete ? "Completed and documented." : "Not yet completed; trustee follow-up recommended."}
                  </div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 md:col-span-2 xl:col-span-2">
                  <div className="font-medium text-foreground">Reviewer notes</div>
                  <div className="mt-2 text-sm text-muted-foreground">{property.managerReview.reviewerNotes}</div>
                </div>
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 md:col-span-2 xl:col-span-3">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
                    Fee notes
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{property.managerReview.feeNotes}</div>
                </div>
                <ManagerReviewForm
                  propertyId={property.id}
                  reviewerNotes={property.managerReview.reviewerNotes}
                  feeNotes={property.managerReview.feeNotes}
                  annualSiteVisitComplete={property.managerReview.annualSiteVisitComplete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Third-party providers and specialists</CardTitle>
                <CardDescription>CPA, lender, broker, counsel, and specialty providers tied to this asset.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {propertyProviders.map((provider) => (
                  <Link
                    key={provider.id}
                    href={`/managers/${provider.id}`}
                    className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4 transition hover:bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Users2 className="h-4 w-4 text-muted-foreground" />
                        {provider.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{provider.type}</div>
                      <div className="text-sm text-muted-foreground">{provider.flaggedConcerns}</div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>{provider.status}</div>
                      <div className="mt-1">Next: {provider.nextAction}</div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Current reporting, debt, tax, insurance, and oversight memos for this asset.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {context.documents.length ? (
                  context.documents.map((document) => (
                    <div key={document.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {document.title}
                        </div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{document.status}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {document.category} · {document.source} · updated {formatDate(document.updatedAt)}
                      </div>
                      {document.fileUrl ? (
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-sm font-medium text-primary"
                        >
                          Open file
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-border bg-white/60 p-8 text-sm text-muted-foreground">
                    No asset-specific documents are missing, but recent oversight notes should still be preserved in the trustee packet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internal notes timeline</CardTitle>
                <CardDescription>Concierge oversight notes, decision memos, and escalation history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <PropertyNoteForm propertyId={property.id} />
                {context.notes.map((note) => (
                  <div key={note.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-foreground">{note.label}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{formatDate(note.date)}</div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{note.author}</div>
                    <div className="mt-3 text-sm text-muted-foreground">{note.note}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Document intake</CardTitle>
                <CardDescription>Upload and tag new supporting files without leaving the asset review workflow.</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploadForm properties={dataset.properties} initialPropertyId={property.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
