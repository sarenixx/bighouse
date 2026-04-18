import Link from "next/link";
import { ArrowRight, FileText, Layers3, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  {
    label: "1. Start at the portfolio level",
    detail: "Lead with the hot sheet, watchlist, and manager snapshot to establish governance value.",
    href: "/",
    icon: Layers3
  },
  {
    label: "2. Drill into one command-center asset",
    detail: "Use Meridian Centre or Westover Flats to show fee scrutiny, refinance oversight, and capex discipline.",
    href: "/properties/meridian-centre",
    icon: Sparkles
  },
  {
    label: "3. Close with trustee-ready reporting",
    detail: "Show how the story becomes a clean, exportable executive report without asking managers to change systems.",
    href: "/reporting/trustee-report",
    icon: FileText
  }
];

export function DemoJourney() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Guided demo path</div>
            <h3 className="mt-2 font-serif text-2xl tracking-tight text-primary">Tell the story in three moves</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              This sequence is designed for family office, trustee, and owner-representative conversations. It keeps the narrative centered on oversight, decision support, and accountability.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/demo">
              Open demo script
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.label}
                href={step.href}
                className="rounded-[1.5rem] border border-border/70 bg-white/70 p-5 transition hover:bg-white"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {step.label}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{step.detail}</p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
