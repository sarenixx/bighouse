import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ReportPreview } from "@/components/report-preview";
import { getReport } from "@/lib/report-library";

export default async function ReportingPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const report = getReport(slug);

  if (!report) notFound();

  return (
    <AppShell
      title={report.title}
      subtitle="Presentation-ready preview of a client-facing executive report with mock print and export controls."
      chromeHiddenOnPrint
    >
      <ReportPreview {...report} />
    </AppShell>
  );
}
