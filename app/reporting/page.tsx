import Link from "next/link";
import { CalendarRange, Download, Filter, Printer } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { DemoJourney } from "@/components/demo-journey";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reports } from "@/lib/report-library";

export default function ReportingPage() {
  return (
    <AppShell
      title="Reporting"
      subtitle="Concise executive reporting that can roll up the portfolio, compare providers, and support trustee review."
      action={
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarRange className="mr-2 h-4 w-4" />
            Apr 1 - Apr 18
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Date range
          </Button>
          <Button asChild>
            <Link href="/api/reports/trustee-report" target="_blank">
            <Download className="mr-2 h-4 w-4" />
            Export bundle
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <DemoJourney />

        <div className="grid gap-6 xl:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.slug}>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                  Audience: {report.audience}. Includes a polished cover page, report card sections, and portfolio commentary suitable for live presentation or follow-up distribution.
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/reporting/${report.slug}`}>Preview</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/api/reports/${report.slug}`} target="_blank">
                    <Printer className="mr-2 h-4 w-4" />
                    Download report card
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
