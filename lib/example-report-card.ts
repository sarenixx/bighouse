import type { ReportDefinition } from "@/lib/report-library";

export function buildExampleReportCardDefinition(email: string): ReportDefinition {
  const generatedAt = `${new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/New_York"
  })} ET`;

  return {
    slug: "trustee-report",
    title: "Amseta Example Report Card",
    subtitle:
      "Real Estate Fiduciary oversight for third-party managed real estate portfolios.",
    audience: "Prospective owner / trustee packet",
    dateRange: "Illustrative hold-period oversight framework",
    preparedFor: `Requested by ${email}`,
    generatedAt,
    distribution: "Ownership, trustees, and family advisors",
    highlights: [
      "Independent oversight",
      "Manager accountability",
      "Portfolio visibility",
      "Generational continuity"
    ],
    sections: [
      {
        title: "The Challenge",
        body:
          "Most owners already have property managers, accountants, brokers, and advisors in place. The missing layer is independent owner-side oversight that verifies execution and keeps accountability clear.",
        bullets: [
          "Independence: providers are not designed to evaluate their own performance for ownership.",
          "Accountability: fragmented reporting across properties and markets delays action.",
          "Responsibility: trustees, heirs, and passive owners carry risk without direct control."
        ]
      },
      {
        title: "The Market Gap",
        body:
          "Property management handles operations. Brokerage handles transactions. Legal and tax advisors handle their domains. The ongoing hold-period oversight function between acquisition and disposition is typically underserved.",
        bullets: [
          "The gap is not deal execution; it is disciplined stewardship during ownership.",
          "Without this layer, issues are often surfaced late and resolved slowly."
        ]
      },
      {
        title: "What Amseta Provides",
        body:
          "Amseta delivers fixed-fee, owner-side fiduciary oversight and coordination across third-party managed portfolios.",
        bullets: [
          "Independent monthly review of manager reporting and key variances.",
          "Structured issue tracking, follow-through, and cross-provider coordination.",
          "A seasoned team of veteran real estate executives supporting owner decisions."
        ]
      },
      {
        title: "Services Provided",
        body:
          "Amseta combines consistent review cadence with practical execution oversight.",
        bullets: [
          "Monthly owner-side review and KPI monitoring (NOI, occupancy, delinquency, concessions).",
          "Quarterly oversight reviews and annual stewardship summary.",
          "Portfolio-level visibility across properties, markets, and managers."
        ]
      },
      {
        title: "Who We Work With",
        body:
          "We primarily support trustee-led and family-led ownership structures that rely on third-party operators.",
        bullets: [
          "Trustees and trust officers.",
          "Families and heirs inheriting operating real estate portfolios.",
          "Advisors helping the next generation get up to speed with asset continuity."
        ]
      },
      {
        title: "Why It Matters",
        body:
          "The result is better clarity, faster intervention, and stronger continuity over long hold periods.",
        bullets: [
          "Visibility: clear view of property and portfolio performance.",
          "Verification: independent confirmation of manager execution.",
          "Accountability: open issues tracked to closure.",
          "Continuity: stable oversight during leadership or generational transitions."
        ]
      },
      {
        title: "Fee & Start",
        body:
          "The service is built to be straightforward to budget and fast to launch.",
        bullets: [
          "Fee model: fixed monthly fee aligned to portfolio complexity.",
          "Onboarding: initial intake and oversight cadence launched in about 30 days.",
          "Objective: disciplined hold-period stewardship without building a full internal team."
        ]
      }
    ],
    appendix: [
      {
        title: "Example report note",
        detail:
          "This is an illustrative packet showing format and decision-support approach. Production reports are tailored to each portfolio."
      },
      {
        title: "Branding",
        detail: "Prepared by Amseta, Real Estate Fiduciary."
      }
    ]
  };
}
