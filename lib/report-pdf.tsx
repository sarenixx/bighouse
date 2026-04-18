import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer
} from "@react-pdf/renderer";

import type { ReportDefinition } from "@/lib/report-library";

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 44,
    paddingHorizontal: 42,
    backgroundColor: "#ffffff",
    color: "#22313a",
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5
  },
  coverBand: {
    backgroundColor: "#314a53",
    borderRadius: 16,
    padding: 28,
    marginBottom: 22
  },
  eyebrow: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#dce6e3"
  },
  coverTitle: {
    fontSize: 26,
    fontFamily: "Times-Bold",
    color: "#f7f5f0",
    marginTop: 12
  },
  coverSubtitle: {
    fontSize: 11,
    color: "#e5ecea",
    marginTop: 12,
    maxWidth: 420
  },
  metadataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18
  },
  metadataCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#d9d2c7",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fcfbf8"
  },
  metadataLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#67767c",
    marginBottom: 6
  },
  metadataValue: {
    fontSize: 10,
    color: "#22313a"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d9d2c7",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 9,
    color: "#4f5d63",
    backgroundColor: "#fcfbf8"
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: "#314a53",
    marginBottom: 8
  },
  sectionBody: {
    fontSize: 11,
    color: "#42535a",
    marginBottom: 14
  },
  bulletCard: {
    borderWidth: 1,
    borderColor: "#ddd6cb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fbfaf7"
  },
  bulletText: {
    fontSize: 10.5,
    color: "#4c5d64"
  },
  appendixTitle: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    color: "#314a53",
    marginBottom: 14
  },
  appendixItem: {
    borderWidth: 1,
    borderColor: "#ddd6cb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fcfbf8"
  },
  appendixItemTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#22313a",
    marginBottom: 6
  },
  appendixItemDetail: {
    fontSize: 10.5,
    color: "#536268"
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#7a858a",
    borderTopWidth: 1,
    borderTopColor: "#e8e1d8",
    paddingTop: 8
  }
});

function ReportFooter({ title }: { title: string }) {
  return (
    <View fixed style={styles.footer}>
      <Text>{title}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

function ReportPdfDocument({ report }: { report: ReportDefinition }) {
  return (
    <Document title={report.title} author="BigHouse Oversight" subject={report.subtitle}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.coverBand}>
          <Text style={styles.eyebrow}>{report.audience}</Text>
          <Text style={styles.coverTitle}>{report.title}</Text>
          <Text style={styles.coverSubtitle}>{report.subtitle}</Text>
        </View>

        <View style={styles.metadataGrid}>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Prepared for</Text>
            <Text style={styles.metadataValue}>{report.preparedFor}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Generated on</Text>
            <Text style={styles.metadataValue}>{report.generatedAt}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Distribution</Text>
            <Text style={styles.metadataValue}>{report.distribution}</Text>
          </View>
          <View style={styles.metadataCard}>
            <Text style={styles.metadataLabel}>Reporting period</Text>
            <Text style={styles.metadataValue}>{report.dateRange}</Text>
          </View>
        </View>

        <View style={styles.chips}>
          {report.highlights.map((highlight) => (
            <Text key={highlight} style={styles.chip}>
              {highlight}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Executive orientation</Text>
        <Text style={styles.sectionBody}>
          This packet is intended to be printable and board-ready. It consolidates owner-side oversight commentary into a format suitable for trustees, family office staff, and senior decision-makers who need clarity without operational noise.
        </Text>

        <ReportFooter title={report.title} />
      </Page>

      {report.sections.map((section) => (
        <Page key={section.title} size="LETTER" style={styles.page}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletCard}>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
          <ReportFooter title={report.title} />
        </Page>
      ))}

      {report.appendix?.length ? (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.appendixTitle}>Appendix</Text>
          {report.appendix.map((item) => (
            <View key={item.title} style={styles.appendixItem}>
              <Text style={styles.appendixItemTitle}>{item.title}</Text>
              <Text style={styles.appendixItemDetail}>{item.detail}</Text>
            </View>
          ))}
          <ReportFooter title={report.title} />
        </Page>
      ) : null}
    </Document>
  );
}

export async function renderReportPdf(report: ReportDefinition) {
  return renderToBuffer(<ReportPdfDocument report={report} />);
}
