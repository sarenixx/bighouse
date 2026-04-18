import type { ReportPreviewProps } from "@/components/report-preview";

export type ReportSlug =
  | "portfolio-rollup"
  | "property-summary"
  | "manager-scorecard"
  | "trustee-report";

export interface ReportDefinition extends ReportPreviewProps {
  slug: ReportSlug;
}

export const reportLibrary: Record<ReportSlug, ReportDefinition> = {
  "portfolio-rollup": {
    slug: "portfolio-rollup",
    title: "Portfolio Rollup Report",
    subtitle:
      "An executive readout of portfolio performance, issue concentration, and next-step decisions across managers, lenders, and specialist providers.",
    audience: "Family office / owner representative",
    dateRange: "Reporting period: April 2026",
    preparedFor: "Halcyon Family Office",
    generatedAt: "April 18, 2026 at 8:00 AM ET",
    distribution: "Owner representative, CIO, controller",
    highlights: ["12 properties", "6 active alerts", "2 critical exceptions", "4 manager reviews due"],
    sections: [
      {
        title: "Executive overview",
        body:
          "Portfolio performance remains fundamentally healthy, but owner attention should remain concentrated on Meridian Centre's refinance path, Westover Flats' fee and capex discipline, and muted renewal growth at Sable Pointe. The broad takeaway is not that managers are failing; it is that oversight remains essential precisely where institutional details can drift.",
        bullets: [
          "Average occupancy remains above 92%, supporting stable cash flow across the portfolio.",
          "Two issues have crossed from watchlist to escalation status and should be documented in the next owner memo.",
          "Manager quality is uneven: two managers are strong, one is watchlist, and one requires closer review."
        ]
      },
      {
        title: "Risk concentration",
        body:
          "Risk is concentrated rather than diffuse. That is a constructive sign for trustees and family office teams because it means the oversight process is narrowing attention instead of generating noise.",
        bullets: [
          "Debt maturity risk is isolated but urgent at Meridian Centre.",
          "Fee fairness questions are concentrated around select multifamily assets rather than system-wide.",
          "Capex delay and budget pressure are linked to a small number of projects with identifiable owner decisions."
        ]
      }
    ],
    appendix: [
      {
        title: "Source inputs",
        detail: "Compiled from manager reporting packets, internal issue notes, lender correspondence, and specialist review updates through April 18, 2026."
      },
      {
        title: "Distribution note",
        detail: "Prepared for internal portfolio review and family office discussion; not intended for manager-side circulation."
      }
    ]
  },
  "property-summary": {
    slug: "property-summary",
    title: "Property-by-Property Summary",
    subtitle: "A concise portfolio book with each asset framed around performance, risks, service-provider posture, and required owner action.",
    audience: "Asset management review",
    dateRange: "Reporting period: April 2026",
    preparedFor: "Owner representative review committee",
    generatedAt: "April 18, 2026 at 8:15 AM ET",
    distribution: "Asset manager, controller, projects lead",
    highlights: ["Meridian Centre", "Westover Flats", "Sable Pointe", "Canal Street Lofts"],
    sections: [
      {
        title: "How to read this book",
        body:
          "Each property page is intentionally written from the perspective of an owner's representative. The point is not merely to restate manager reporting, but to synthesize performance, fees, service-provider execution, and whether current activity is sufficient."
      },
      {
        title: "Current exceptions",
        body:
          "Meridian Centre and Westover Flats are the most useful properties to discuss in a meeting because they show how the platform handles refinance risk, leasing softness, capex drift, and fee questions without becoming operationally noisy.",
        bullets: [
          "Meridian Centre: refinance timing, under-market leasing proposal, capex overrun.",
          "Westover Flats: renovation delay, fee challenge, and missed reporting deadline.",
          "Sable Pointe: under-market renewal growth despite strong local demand."
        ]
      }
    ],
    appendix: [
      {
        title: "Property packet scope",
        detail: "Each property summary is designed to fit into a monthly review book with one page of narrative and one page of supporting metrics."
      }
    ]
  },
  "manager-scorecard": {
    slug: "manager-scorecard",
    title: "Manager Scorecard Report",
    subtitle:
      "A comparative view of manager execution quality across reporting, occupancy, rent growth, communication, capex, and fee fairness.",
    audience: "Service provider review",
    dateRange: "Reporting period: April 2026",
    preparedFor: "Oversight leadership team",
    generatedAt: "April 18, 2026 at 8:20 AM ET",
    distribution: "Owner representative, trust officer, operations lead",
    highlights: ["4 managers", "Score range 71-91", "Fee notes included", "Site visit completion tracked"],
    sections: [
      {
        title: "Comparative readout",
        body:
          "This report is designed to support direct service-provider conversations. It helps the owner representative move from generalized dissatisfaction to specific, defensible feedback categories."
      },
      {
        title: "Most important finding",
        body:
          "Manager quality is not simply a question of occupancy. The largest differences appear in reporting timeliness, fee explanation quality, and whether issues are resolved with urgency and clarity.",
        bullets: [
          "Crescent Ridge Management sets the standard for reporting quality and executive readiness.",
          "Sterling Commercial Advisors requires closer performance management around leasing urgency and escalation handling.",
          "Bridgeview Residential remains viable but needs firmer controls around fees and reporting cadence."
        ]
      }
    ],
    appendix: [
      {
        title: "Scoring note",
        detail: "Scores blend quantitative property outcomes with qualitative service metrics such as timeliness, communication quality, and fee clarity."
      }
    ]
  },
  "trustee-report": {
    slug: "trustee-report",
    title: "Trustee Oversight Report",
    subtitle:
      "A fiduciary-facing memo that explains what has been reviewed, where risk is concentrated, and which owner actions are prudent at this stage.",
    audience: "Trustee / fiduciary packet",
    dateRange: "Prepared April 18, 2026",
    preparedFor: "Trust officers and fiduciary committee",
    generatedAt: "April 18, 2026 at 8:30 AM ET",
    distribution: "Trustee packet, family office archive, internal oversight lead",
    highlights: ["Fiduciary framing", "Exception log", "Rationale documented", "Decision-ready"],
    sections: [
      {
        title: "Trustee summary",
        body:
          "The portfolio remains broadly stable, and current oversight work is focused on a manageable set of specific issues rather than a generalized operating breakdown. The key fiduciary point is that exceptions have been identified early, documented clearly, and paired with recommended next actions.",
        bullets: [
          "Meridian Centre requires a decision on refinance path within the current review cycle.",
          "Westover Flats should not receive additional project administration fees without written support and benchmarking.",
          "No evidence suggests a portfolio-wide service failure, but manager quality remains differentiated and should continue to be reviewed formally."
        ]
      },
      {
        title: "Oversight actions taken",
        body:
          "The owner-representative function has already escalated late reporting, challenged unsupported fee increases, coordinated with debt and leasing specialists, and documented where projects have moved outside expected tolerances.",
        bullets: [
          "Requested lender-ready refinance decision grid for Meridian Centre.",
          "Flagged Westover Flats fee anomaly for trustee explanation unless cured.",
          "Scheduled follow-up reviews for CAM timing, insurance renewal posture, and annual site visits."
        ]
      },
      {
        title: "Recommended next decisions",
        body:
          "Trustees should view the current portfolio posture as one that benefits from measured intervention, not reactive overhaul. The discipline lies in documenting why selected issues matter and why the proposed response is proportionate.",
        bullets: [
          "Approve or redirect the Meridian refinance strategy before lender outreach begins.",
          "Require fee support and updated schedule discipline for Westover Flats.",
          "Maintain scheduled manager scorecard reviews and annual service-provider benchmarking."
        ]
      }
    ],
    appendix: [
      {
        title: "Exception log reference",
        detail: "Referenced exceptions include Meridian refinance timing, Westover fee escalation, and follow-up review cadence for provider benchmarking."
      },
      {
        title: "Circulation guidance",
        detail: "This format is intended for trustee review and can be printed without dashboard chrome for board-style packets."
      }
    ]
  }
};

export function getReport(slug: string) {
  return reportLibrary[slug as ReportSlug];
}

export const reports = Object.values(reportLibrary);
