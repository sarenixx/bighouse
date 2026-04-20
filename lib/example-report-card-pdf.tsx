import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import type { ReportDefinition } from "@/lib/report-library";

const LANDSCAPE_LETTER: [number, number] = [792, 612];

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 34,
    paddingHorizontal: 34,
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontFamily: "Helvetica",
    fontSize: 10
  },
  coverIntro: {
    fontSize: 11,
    lineHeight: 1.55,
    color: "#374151",
    marginBottom: 12
  },
  coverSignature: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 18
  },
  coverBand: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: "#f9fafb",
    marginBottom: 12
  },
  reportTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#111827"
  },
  reportMeta: {
    fontSize: 12,
    color: "#374151",
    marginTop: 6
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4
  },
  sectionPeriod: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 12
  },
  highlightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10
  },
  highlightChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    backgroundColor: "#f9fafb",
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 9,
    color: "#374151",
    marginRight: 7,
    marginBottom: 7
  },
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    overflow: "hidden"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingVertical: 8
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    paddingHorizontal: 8
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 7
  },
  tableRowLast: {
    borderBottomWidth: 0
  },
  colArea: {
    width: "24%"
  },
  colSummary: {
    width: "43%"
  },
  colKpi: {
    width: "33%"
  },
  cellArea: {
    fontSize: 9.8,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    paddingHorizontal: 8,
    lineHeight: 1.35
  },
  cellSummary: {
    fontSize: 9.4,
    color: "#374151",
    paddingHorizontal: 8,
    lineHeight: 1.35
  },
  cellKpi: {
    fontSize: 9.2,
    color: "#4b5563",
    paddingHorizontal: 8,
    lineHeight: 1.35
  },
  noteBlock: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb"
  },
  noteLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4
  },
  noteText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4
  },
  appendixItem: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    backgroundColor: "#f9fafb",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8
  },
  appendixTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 3
  },
  appendixDetail: {
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.4
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 6
  },
  footerText: {
    fontSize: 8.5,
    color: "#6b7280"
  }
});

function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars - 1).trimEnd()}…`;
}

function chunkSections<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function ReportFooter({ title, preparedFor, generatedAt }: { title: string; preparedFor: string; generatedAt: string }) {
  return (
    <View fixed style={styles.footer}>
      <Text style={styles.footerText}>{title}</Text>
      <Text style={styles.footerText}>{preparedFor}</Text>
      <Text style={styles.footerText}>
        {generatedAt} ·{" "}
        <Text
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Text>
    </View>
  );
}

function DashboardPage({
  report,
  title,
  sections
}: {
  report: ReportDefinition;
  title: string;
  sections: ReportDefinition["sections"];
}) {
  return (
    <Page size={LANDSCAPE_LETTER} style={styles.page}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionPeriod}>Period: {report.dateRange}</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={styles.colArea}>
            <Text style={styles.tableHeaderCell}>Oversight Area</Text>
          </View>
          <View style={styles.colSummary}>
            <Text style={styles.tableHeaderCell}>Owner-Side Summary</Text>
          </View>
          <View style={styles.colKpi}>
            <Text style={styles.tableHeaderCell}>Key Indicators / Notes</Text>
          </View>
        </View>
        {sections.map((section, index) => {
          const summary = truncateText(section.body, 285);
          const indicators = (section.bullets ?? [])
            .slice(0, 3)
            .map((bullet) => `• ${truncateText(bullet, 120)}`)
            .join("\n");
          const rowStyle =
            index === sections.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow;

          return (
            <View key={section.title} style={rowStyle}>
              <View style={styles.colArea}>
                <Text style={styles.cellArea}>{section.title}</Text>
              </View>
              <View style={styles.colSummary}>
                <Text style={styles.cellSummary}>{summary}</Text>
              </View>
              <View style={styles.colKpi}>
                <Text style={styles.cellKpi}>{indicators}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.noteBlock}>
        <Text style={styles.noteLabel}>NOTES:</Text>
        <Text style={styles.noteText}>
          This packet is an illustrative Amseta report card format designed for trustees,
          families, and advisors evaluating third-party managed real estate portfolios.
        </Text>
      </View>

      <ReportFooter title={report.title} preparedFor={report.preparedFor} generatedAt={report.generatedAt} />
    </Page>
  );
}

function ExampleReportCardPdfDocument({ report }: { report: ReportDefinition }) {
  const sectionChunks = chunkSections(report.sections, 3);

  return (
    <Document title={report.title} author="Amseta" subject={report.subtitle}>
      <Page size={LANDSCAPE_LETTER} style={styles.page}>
        <Text style={styles.coverIntro}>
          This report was developed as part of Amseta&apos;s Real Estate Fiduciary process to provide
          an independent, periodic owner-side review of third-party managed real estate assets and
          manager execution against key performance indicators.
        </Text>
        <Text style={styles.coverIntro}>
          We have distilled portfolio oversight into a concise report-card format that clarifies what
          is working, what needs intervention, and where ownership decisions should be prioritized.
        </Text>
        <Text style={styles.coverSignature}>-Amseta Real Estate Fiduciary Team</Text>

        <View style={styles.coverBand}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportMeta}>{report.preparedFor}</Text>
          <Text style={styles.reportMeta}>Period: {report.dateRange}</Text>
        </View>

        <View style={styles.highlightRow}>
          {report.highlights.map((highlight) => (
            <Text key={highlight} style={styles.highlightChip}>
              {highlight}
            </Text>
          ))}
        </View>

        <View style={styles.noteBlock}>
          <Text style={styles.noteLabel}>REPORT ORIENTATION:</Text>
          <Text style={styles.noteText}>
            This packet is intended to be decision-ready and printable. It prioritizes ownership
            visibility, manager accountability, and stewardship continuity during long-term holding periods.
          </Text>
        </View>

        <ReportFooter title={report.title} preparedFor={report.preparedFor} generatedAt={report.generatedAt} />
      </Page>

      {sectionChunks.map((chunk, index) => (
        <DashboardPage
          key={`dashboard-${index + 1}`}
          report={report}
          title={`Oversight Dashboard ${index + 1}`}
          sections={chunk}
        />
      ))}

      {report.appendix?.length ? (
        <Page size={LANDSCAPE_LETTER} style={styles.page}>
          <Text style={styles.sectionTitle}>Appendix</Text>
          <Text style={styles.sectionPeriod}>Reference notes and assumptions</Text>
          {report.appendix.map((item) => (
            <View key={item.title} style={styles.appendixItem}>
              <Text style={styles.appendixTitle}>{item.title}</Text>
              <Text style={styles.appendixDetail}>{item.detail}</Text>
            </View>
          ))}
          <ReportFooter title={report.title} preparedFor={report.preparedFor} generatedAt={report.generatedAt} />
        </Page>
      ) : null}
    </Document>
  );
}

export async function renderExampleReportCardPdf(report: ReportDefinition) {
  return renderToBuffer(<ExampleReportCardPdfDocument report={report} />);
}
