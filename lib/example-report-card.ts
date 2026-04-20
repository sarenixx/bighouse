import type { ReportDefinition } from "@/lib/report-library";

export function buildExampleReportCardDefinition(email: string): ReportDefinition {
  const generatedAt = `${new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/New_York"
  })} ET`;

  return {
    slug: "trustee-report",
    title: "Quarterly Portfolio Report Card",
    subtitle:
      "Illustrative owner-side review for a third-party managed real estate portfolio.",
    audience: "Ownership and trustee review packet",
    dateRange: "Q1 2026 (January 1, 2026 to March 31, 2026)",
    preparedFor: `Requested by ${email}`,
    generatedAt,
    distribution: "Ownership, trustees, and family advisors",
    highlights: [
      "12 properties | 4,280 units",
      "Occupancy: 94.6% (+0.7 pts QoQ)",
      "NOI: $9.4M (+1.8% vs budget)",
      "Delinquency: 2.1% of billed rent",
      "Open actions: 18 (11 on track)"
    ],
    sections: [
      {
        title: "Portfolio Snapshot",
        body:
          "Portfolio performance improved quarter over quarter, driven by occupancy gains, steady rent growth, and stronger collections discipline across most assets.",
        bullets: [
          "12 properties across 3 markets; 4,280 multifamily units monitored.",
          "Gross potential rent: $11.2M | Collected revenue: $10.5M.",
          "Weighted occupancy: 94.6% versus 93.9% last quarter."
        ]
      },
      {
        title: "NOI and Budget Variance",
        body:
          "Quarter NOI finished above budget, with utility and bad-debt performance offsetting higher payroll and repair spend at two properties.",
        bullets: [
          "Portfolio NOI: $9.4M, or +1.8% versus Q1 budget.",
          "Positive variance: utilities -4.2% and bad debt -3.1%.",
          "Watch list: payroll +2.6% and repairs/maintenance +5.4%."
        ]
      },
      {
        title: "Revenue and Collections",
        body:
          "Collections remained stable, concessions stayed within target range, and delinquency concentration was isolated to two assets requiring focused follow-up.",
        bullets: [
          "Average effective rent: $2,145 (+2.9% year over year).",
          "Concessions: 2.4% of billed rent (target is 2.5% or lower).",
          "A/R over 60 days: $228K, primarily at 2 properties."
        ]
      },
      {
        title: "Leasing and Turnover",
        body:
          "Leasing momentum improved, though make-ready cycle times at select assets still lag target and are impacting occupancy recovery speed.",
        bullets: [
          "Renewal capture: 63% versus 60% target.",
          "Average days vacant: 24 days versus 21-day target.",
          "Ready-to-lease over 30 days: 37 units across 3 assets."
        ]
      },
      {
        title: "Expense Control",
        body:
          "Operating expense ratio tracked favorably to budget overall, with property-specific repair spend and staffing pressure requiring tighter variance management.",
        bullets: [
          "Expense ratio: 38.7% versus 39.4% budget.",
          "Repairs concentrated at Oak Terrace and Riverbend.",
          "Insurance and taxes near plan; landscaping contracts rebid in Q2."
        ]
      },
      {
        title: "Property Condition and CapEx",
        body:
          "Capital execution remained mostly on schedule, with one delayed project and clear reserve coverage to support near-term maintenance needs.",
        bullets: [
          "Active projects: 6 total | 1 project at risk of schedule slip.",
          "Life-safety scope completed at 4 assets this quarter.",
          "Deferred maintenance reserve coverage: 8.6 months."
        ]
      },
      {
        title: "Manager Scorecard",
        body:
          "Manager performance was mixed: reporting quality improved, but turnover execution and vendor follow-through remained uneven by asset.",
        bullets: [
          "Manager A score: 4.4/5 with strong collections and reporting cadence.",
          "Manager B score: 3.6/5 due to turn-time and vendor closeout delays.",
          "Report delivery timing improved from 6.2 to 4.8 business days."
        ]
      },
      {
        title: "Risk Register",
        body:
          "Material risks are concentrated in inspection follow-through, market concentration, and overdue vendor actions rather than financing pressure.",
        bullets: [
          "Regulatory recheck scheduled for April 29, 2026 at one property.",
          "41% of NOI is concentrated in one submarket.",
          "Portfolio DSCR averaged 1.54x with no covenant pressure."
        ]
      },
      {
        title: "Next-Quarter Priorities",
        body:
          "Q2 focus is execution discipline: reduce vacancy friction, close aging action items, and resolve recurring vendor bottlenecks.",
        bullets: [
          "Reduce ready-to-lease backlog from 37 to fewer than 20 units.",
          "Close all 18 open actions and escalate 4 overdue vendor items.",
          "Complete insurance renewal strategy and tax appeal submissions."
        ]
      }
    ],
    appendix: [
      {
        title: "Property-level operating snapshot",
        detail:
          "Oak Terrace: 95.2% occ, NOI +2.1% vs budget | Riverbend: 92.8% occ, NOI -1.7% vs budget | Midtown Commons: 96.4% occ, NOI +3.2% vs budget."
      },
      {
        title: "Action log summary",
        detail:
          "18 open actions: 11 on track, 4 overdue, 3 newly opened this quarter. Primary overdue category is vendor completion timelines."
      },
      {
        title: "Report note",
        detail:
          "This is an illustrative sample report card. Production reports include property-level schedules, supporting detail, and client-specific benchmarks."
      },
      {
        title: "Prepared by",
        detail: "Amseta | Real Estate Fiduciary"
      }
    ]
  };
}
