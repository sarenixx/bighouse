import { BadgeCheck, CalendarClock, FileArchive, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportActions } from "@/components/report-actions";

export interface ReportSection {
  title: string;
  body: string;
  bullets?: string[];
}

export interface ReportPreviewProps {
  slug?: string;
  title: string;
  subtitle: string;
  audience: string;
  dateRange: string;
  preparedFor: string;
  generatedAt: string;
  distribution: string;
  sections: ReportSection[];
  highlights: string[];
  appendix?: Array<{ title: string; detail: string }>;
}

export function ReportPreview({
  title,
  slug,
  subtitle,
  audience,
  dateRange,
  preparedFor,
  generatedAt,
  distribution,
  sections,
  highlights,
  appendix = []
}: ReportPreviewProps) {
  return (
    <div className="report-document space-y-6">
      <Card className="overflow-hidden print:shadow-none">
        <div className="bg-primary px-6 py-7 text-primary-foreground">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">{audience}</div>
              <h2 className="mt-2 font-serif text-4xl tracking-tight">{title}</h2>
              <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80">{subtitle}</p>
            </div>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <div>{dateRange}</div>
              <div>Prepared by BigHouse Oversight</div>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] print:gap-6">
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight) => (
              <Badge key={highlight} variant="outline" className="bg-white">
                {highlight}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <ReportActions downloadUrl={`/api/reports/${slug ?? "trustee-report"}`} />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden print:shadow-none">
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Prepared for
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{preparedFor}</div>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              Generated on
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{generatedAt}</div>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              Distribution
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{distribution}</div>
          </div>
          <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileArchive className="h-4 w-4 text-muted-foreground" />
              Appendix status
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {appendix.length ? `${appendix.length} supporting items attached.` : "No appendix items for this report."}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr] print:block">
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={section.title} className={index > 0 ? "print-page-break-auto" : ""}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>Executive summary phrased for direct client or trustee consumption.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">{section.body}</p>
                {section.bullets ? (
                  <div className="space-y-2">
                    {section.bullets.map((bullet) => (
                      <div key={bullet} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                        {bullet}
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="print-page-break print:mt-8">
          <CardHeader>
            <CardTitle>Presentation notes</CardTitle>
            <CardDescription>What this report is meant to communicate in a live demo or board-style readout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
              The visual tone is intentionally calm and restrained so risk items feel curated rather than alarmist.
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
              Each section is written as if the owner representative has already synthesized inputs from managers, lenders, brokers, and specialists.
            </div>
            <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
              PDF export is now live through a server-side document endpoint, making these previews usable as actual downloadable trustee or owner packets.
            </div>
          </CardContent>
        </Card>
      </div>

      {appendix.length ? (
        <Card className="print-page-break print:shadow-none">
          <CardHeader>
            <CardTitle>Appendix</CardTitle>
            <CardDescription>Supporting references and distribution notes included with the report package.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {appendix.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                <div className="font-medium text-foreground">{item.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{item.detail}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
