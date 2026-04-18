import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, LayoutDashboard, Landmark, SearchCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const storyline = [
  {
    title: "Open at the portfolio view",
    detail: "Show that the product answers 'what needs attention right now?' before anything else.",
    proof: "Use the hot sheet, watchlist, occupancy trend, and manager snapshot.",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Drill into one problem asset",
    detail: "Use Meridian Centre to show debt maturity risk, leasing softness, and capex overrun in a single narrative.",
    proof: "Move through Financials, Projects / Capex, and Manager Review tabs.",
    href: "/properties/meridian-centre",
    icon: SearchCheck
  },
  {
    title: "Reinforce service orchestration",
    detail: "Show how managers, lenders, brokers, CPAs, and specialists are reviewed in one place.",
    proof: "Use Managers / Vendors and Tasks & Reviews to emphasize coordination above operators.",
    href: "/managers",
    icon: Landmark
  },
  {
    title: "Close with reporting",
    detail: "End on an executive-ready trustee report so the buyer sees outputs, not just dashboards.",
    proof: "Open the Trustee Report preview and point to print/export controls.",
    href: "/reporting/trustee-report",
    icon: FileText
  }
];

export default function DemoPage() {
  return (
    <AppShell
      title="Guided Demo"
      subtitle="A polished walkthrough script for live presentations with trustees, family offices, and owner representatives."
      action={
        <Button asChild variant="secondary">
          <Link href="/login">
            Open client entry
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Live walkthrough sequence</CardTitle>
            <CardDescription>Use this path to keep the story focused on trust, verification, and executive decision support.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {storyline.map((step, index) => {
              const Icon = step.icon;
              return (
                <Link key={step.title} href={step.href} className="block rounded-[1.5rem] border border-border/70 bg-white/70 p-5 transition hover:bg-white">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step {index + 1}</div>
                      <div className="mt-1 text-lg font-medium text-foreground">{step.title}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                      <div className="mt-3 rounded-[1.1rem] border border-border/70 bg-white/80 p-3 text-sm text-muted-foreground">
                        Presenter cue: {step.proof}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key talk track</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "This sits above property managers rather than replacing them.",
                "The core value is oversight, issue prioritization, and coordination across providers.",
                "Every screen is designed for owners, trustees, and family office staff who need concise decisions."
              ].map((line) => (
                <div key={line} className="flex items-start gap-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <span>{line}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best supporting pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/tasks">Tasks & Reviews <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/reporting">Reporting center <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/documents">Documents library <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
