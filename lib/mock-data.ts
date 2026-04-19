import type {
  CapexProject,
  DocumentRecord,
  ExpenseCategoryReview,
  Issue,
  Manager,
  OversightContact,
  PortfolioDataset,
  Property,
  PropertyScoreInputs,
  Provider,
  TaskItem,
  TimelineNote,
  StatusTone
} from "@/lib/types";
import { slugify } from "@/lib/utils";

const monthlySeries = (
  base: {
    performance: number[];
    occupancy: number[];
    collected: number[];
    budget: number[];
    revenue: number[];
    expenses: number[];
    noi: number[];
    turnDays: number[];
    vacancyRate: number[];
  }
) =>
  [
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
    "2026-04"
  ].map((month, index) => ({
    month,
    performance: base.performance[index],
    occupancy: base.occupancy[index],
    collected: base.collected[index],
    budget: base.budget[index],
    revenue: base.revenue[index],
    expenses: base.expenses[index],
    noi: base.noi[index],
    turnDays: base.turnDays[index],
    vacancyRate: base.vacancyRate[index]
  }));

const assetLeadByManager: Record<string, string> = {
  "mgr-bridge": "Jordan Hale",
  "mgr-millstone": "Leah Morgan",
  "mgr-sterling": "Maya Ford",
  "mgr-crescent": "Reed Lawson"
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function percentChange(current: number, baseline: number) {
  if (!baseline) return 0;
  return ((current - baseline) / baseline) * 100;
}

function getExpenseMix(propertyType: Property["type"]) {
  if (propertyType === "Retail") {
    return [
      { category: "CAM / recoverables", weight: 0.24 },
      { category: "Repairs & maintenance", weight: 0.2 },
      { category: "Contract services", weight: 0.18 },
      { category: "Utilities", weight: 0.12 },
      { category: "Administrative / professional", weight: 0.14 },
      { category: "Marketing / leasing", weight: 0.12 }
    ];
  }

  if (propertyType === "Office") {
    return [
      { category: "Contract services", weight: 0.23 },
      { category: "Repairs & maintenance", weight: 0.19 },
      { category: "Utilities", weight: 0.17 },
      { category: "Administrative / professional", weight: 0.16 },
      { category: "Security / janitorial", weight: 0.13 },
      { category: "Leasing / tenant improvements", weight: 0.12 }
    ];
  }

  if (propertyType === "Industrial") {
    return [
      { category: "Repairs & maintenance", weight: 0.22 },
      { category: "Contract services", weight: 0.2 },
      { category: "Utilities", weight: 0.16 },
      { category: "Administrative / professional", weight: 0.15 },
      { category: "Yard / logistics support", weight: 0.15 },
      { category: "Brokerage / leasing", weight: 0.12 }
    ];
  }

  return [
    { category: "Repairs & maintenance", weight: 0.24 },
    { category: "Payroll / site ops", weight: 0.18 },
    { category: "Utilities", weight: 0.15 },
    { category: "Contract services", weight: 0.16 },
    { category: "Administrative / professional", weight: 0.14 },
    { category: "Turns / leasing", weight: 0.13 }
  ];
}

function deriveExpenseCategories(
  property: Omit<Property, "slug" | "serviceProviderIds" | "scoreInputs" | "expenseCategories" | "oversightContacts">
): ExpenseCategoryReview[] {
  const latestExpense = (property.performance.at(-1)?.expenses ?? property.adminCosts / 1000) * 1000;
  const priorExpense =
    (property.performance.at(-2)?.expenses ?? property.performance.at(-1)?.expenses ?? property.adminCosts / 1000) *
    1000;
  const issuePressure = property.openIssues > 2 ? 0.08 : property.openIssues > 0 ? 0.03 : 0;
  const budgetPressure = Math.max(0, -property.budgetVsActual) / 100;

  return getExpenseMix(property.type).map((entry, index) => {
    const current = latestExpense * (entry.weight + budgetPressure * (index === 0 ? 0.1 : 0.025));
    const priorMonth = priorExpense * entry.weight;
    const variancePercent = percentChange(current, priorMonth);
    const tone: StatusTone =
      variancePercent > 12 || (index === 0 && issuePressure > 0)
        ? "alert"
        : variancePercent > 6
          ? "watch"
          : "good";

    return {
      category: entry.category,
      current,
      priorMonth,
      variancePercent,
      tone,
      review:
        tone === "alert"
          ? "Review invoice stack, coding support, and possible duplicate or miscoded billing."
          : tone === "watch"
            ? "Tie variance back to prior-period accruals and manager explanations."
            : "Category remains in the normal operating band."
    };
  });
}

function deriveScoreInputs(
  property: Omit<Property, "slug" | "serviceProviderIds" | "scoreInputs" | "expenseCategories" | "oversightContacts">
): PropertyScoreInputs {
  const latestRevenue = property.performance.at(-1)?.revenue ?? property.grossMonthlyRent / 1000;
  const firstRevenue = property.performance[0]?.revenue ?? latestRevenue;
  const latestNoi = property.performance.at(-1)?.noi ?? property.noi / 1000;
  const firstNoi = property.performance[0]?.noi ?? latestNoi;
  const latestExpense = (property.performance.at(-1)?.expenses ?? property.adminCosts / 1000) * 1000;
  const currentVacancy = property.performance.at(-1)?.vacancyRate ?? Math.max(0, 100 - property.occupancy);
  const projectPressure =
    /delayed|over budget|decision/i.test(property.activeProjectStatus) ? 0.12 : 0.04;

  const agedReceivablesAmount = property.grossMonthlyRent * ((property.delinquencies * 1.15) / 100);
  const agedReceivablesDays = clamp(
    Math.round(16 + property.delinquencies * 13 + Math.max(0, currentVacancy - 4) * 2),
    14,
    95
  );
  const agedPayablesAmount =
    latestExpense * (0.18 + Math.max(0, -property.budgetVsActual) / 100 + projectPressure);
  const agedPayablesDays = clamp(
    Math.round(18 + Math.max(0, -property.budgetVsActual) * 3 + property.openIssues * 2 + projectPressure * 40),
    14,
    90
  );

  const leaseComplianceStatus: StatusTone =
    property.managerReview.reportingTimeliness === "alert" ||
    property.managerReview.rentGrowthExecution === "alert"
      ? "alert"
      : property.managerReview.reportingTimeliness === "watch" ||
          property.managerReview.rentGrowthExecution === "watch"
        ? "watch"
        : "good";

  const managementAgreementStatus: StatusTone =
    property.managerReview.feeFairness === "alert" || property.managerReview.expenseDiscipline === "alert"
      ? "alert"
      : property.managerReview.feeFairness === "watch" || property.managerReview.expenseDiscipline === "watch"
        ? "watch"
        : "good";

  return {
    agedReceivablesAmount,
    agedReceivablesDays,
    agedPayablesAmount,
    agedPayablesDays,
    sameStoreRevenueChange: percentChange(latestRevenue, firstRevenue),
    sameStoreNoiChange: percentChange(latestNoi, firstNoi),
    leaseComplianceStatus,
    leaseComplianceNotes:
      property.type === "Retail"
        ? "Lease compliance reflects CAM support, reconciliation timing, and recoverable coding quality."
        : "Lease compliance reflects reporting timeliness, lease-file discipline, and renewal execution.",
    managementAgreementStatus,
    managementAgreementNotes:
      property.managerReview.feeNotes || "Management agreement performance remains inside the expected range."
  };
}

function deriveOversightContacts(
  property: Omit<Property, "slug" | "serviceProviderIds" | "scoreInputs" | "expenseCategories" | "oversightContacts">,
  managerName: string,
  serviceProviderIds: string[]
): OversightContact[] {
  const lenderName =
    providers.find((provider) => serviceProviderIds.includes(provider.id) && provider.type === "Lender")?.name ||
    providers.find((provider) => serviceProviderIds.includes(provider.id) && provider.type === "Debt Broker")?.name ||
    "Debt contact pending";
  const specialistName =
    providers.find((provider) =>
      serviceProviderIds.includes(provider.id) &&
      ["CAM Specialist", "CPA", "Attorney", "Insurance Advisor"].includes(provider.type)
    )?.name || "Specialist under review";

  return [
    {
      role: "Real estate fiduciary",
      name: "Avery Bennett",
      detail: "Trust Officer · final approvals, escalation, and reporting accountability."
    },
    {
      role: "Asset oversight lead",
      name: assetLeadByManager[property.managerId] ?? "Portfolio oversight lead",
      detail: `Monthly operating report and health-score owner for ${property.market}.`
    },
    {
      role: "Property manager",
      name: managerName,
      detail: `Primary management agreement for ${property.name}.`
    },
    {
      role: "Debt / capital contact",
      name: lenderName,
      detail: "Debt, refinance, and capital-markets coordination."
    },
    {
      role: "Specialist lead",
      name: specialistName,
      detail: "Lease, CAM, tax, legal, or insurance support."
    }
  ];
}

export const managers: Manager[] = [
  {
    id: "mgr-bridge",
    name: "Bridgeview Residential",
    region: "Sun Belt",
    propertyIds: ["prop-westover", "prop-sable", "prop-ashton"],
    status: "Watchlist",
    score: 76,
    lastReviewDate: "2026-04-08",
    feePosition: "3.6% management fee; admin add-ons under review.",
    issueCount: 4
  },
  {
    id: "mgr-millstone",
    name: "Millstone Asset Services",
    region: "Mid-Atlantic",
    propertyIds: ["prop-harbor", "prop-ridge", "prop-copper"],
    status: "Strong",
    score: 89,
    lastReviewDate: "2026-04-10",
    feePosition: "In-line with market and reporting cadence is strong.",
    issueCount: 2
  },
  {
    id: "mgr-sterling",
    name: "Sterling Commercial Advisors",
    region: "National",
    propertyIds: ["prop-meridian", "prop-dunlin", "prop-yard"],
    status: "Review needed",
    score: 71,
    lastReviewDate: "2026-03-28",
    feePosition: "Retail CAM reconciliation delays impacting owner visibility.",
    issueCount: 5
  },
  {
    id: "mgr-crescent",
    name: "Crescent Ridge Management",
    region: "West Coast",
    propertyIds: ["prop-lark", "prop-canal", "prop-atelier"],
    status: "Strong",
    score: 91,
    lastReviewDate: "2026-04-03",
    feePosition: "Excellent leasing execution; premium fees supported by results.",
    issueCount: 1
  }
];

export const providers: Provider[] = [
  {
    id: "prov-grant",
    name: "Grant & Vale CPA",
    type: "CPA",
    assignedPropertyIds: ["prop-westover", "prop-harbor", "prop-meridian", "prop-lark"],
    status: "Active",
    lastReviewed: "2026-03-22",
    flaggedConcerns: "K-1 timing improved after February escalation.",
    feeNotes: "Annual fee up 4.1%; within expectation.",
    contractRenewalDate: "2026-12-15",
    nextAction: "Confirm mid-year tax planning assumptions.",
    performanceReviewed: true
  },
  {
    id: "prov-citadel",
    name: "Citadel Debt Advisory",
    type: "Debt Broker",
    assignedPropertyIds: ["prop-meridian", "prop-yard", "prop-canal"],
    status: "Review due",
    lastReviewed: "2025-11-12",
    flaggedConcerns: "Need refinance strategy memo for Meridian Centre.",
    feeNotes: "Success fee proposal pending owner approval.",
    contractRenewalDate: "2026-06-30",
    nextAction: "Deliver lender outreach list before May committee review.",
    performanceReviewed: false
  },
  {
    id: "prov-anchor",
    name: "Anchor National Bank",
    type: "Lender",
    assignedPropertyIds: ["prop-meridian", "prop-yard", "prop-westover"],
    status: "Active",
    lastReviewed: "2026-04-02",
    flaggedConcerns: "Meridian debt maturity within 11 months.",
    feeNotes: "Rate cap extension option to be evaluated.",
    contractRenewalDate: "2027-01-31",
    nextAction: "Review covenant package in Q2.",
    performanceReviewed: true
  },
  {
    id: "prov-lineage",
    name: "Lineage Cost Seg",
    type: "Cost Seg Provider",
    assignedPropertyIds: ["prop-ashton", "prop-yard"],
    status: "Active",
    lastReviewed: "2026-02-19",
    flaggedConcerns: "Awaiting final report on Yardline Logistics Park.",
    feeNotes: "Fixed fee retained; no concerns.",
    contractRenewalDate: "2026-10-31",
    nextAction: "Coordinate deliverable timing with CPA.",
    performanceReviewed: true
  },
  {
    id: "prov-camber",
    name: "Camber CAM Review",
    type: "CAM Specialist",
    assignedPropertyIds: ["prop-dunlin", "prop-copper"],
    status: "Watchlist",
    lastReviewed: "2026-03-09",
    flaggedConcerns: "Reconciliation package was late for Dunlin Shops.",
    feeNotes: "Hourly billing needs tighter scope controls.",
    contractRenewalDate: "2026-09-30",
    nextAction: "Approve revised review scope for 2026 true-up.",
    performanceReviewed: false
  },
  {
    id: "prov-cedar",
    name: "Cedar Exchange Services",
    type: "1031 Accommodator",
    assignedPropertyIds: ["prop-canal"],
    status: "Active",
    lastReviewed: "2026-01-18",
    flaggedConcerns: "No active exchange today; readiness check only.",
    feeNotes: "Retainer remains dormant.",
    contractRenewalDate: "2027-02-14",
    nextAction: "Keep on standby for disposition scenarios.",
    performanceReviewed: true
  },
  {
    id: "prov-marlow",
    name: "Marlow Brokerage Group",
    type: "Broker",
    assignedPropertyIds: ["prop-meridian", "prop-dunlin", "prop-canal"],
    status: "Watchlist",
    lastReviewed: "2026-04-05",
    flaggedConcerns: "Rent growth on Meridian suites trails submarket comps.",
    feeNotes: "Leasing commission proposal needs benchmarking.",
    contractRenewalDate: "2026-08-15",
    nextAction: "Provide comp package and renewal strategy.",
    performanceReviewed: false
  },
  {
    id: "prov-hawthorne",
    name: "Hawthorne Counsel LLP",
    type: "Attorney",
    assignedPropertyIds: ["prop-westover", "prop-meridian", "prop-canal", "prop-yard"],
    status: "Active",
    lastReviewed: "2026-02-28",
    flaggedConcerns: "Monitoring contractor claim at Westover Flats.",
    feeNotes: "Bills are detailed and predictable.",
    contractRenewalDate: "2027-03-01",
    nextAction: "Finalize contractor reserve language.",
    performanceReviewed: true
  },
  {
    id: "prov-aegis",
    name: "Aegis Risk Partners",
    type: "Insurance Advisor",
    assignedPropertyIds: ["prop-westover", "prop-harbor", "prop-meridian", "prop-lark", "prop-yard"],
    status: "Review due",
    lastReviewed: "2025-12-20",
    flaggedConcerns: "Portfolio-wide deductible options need annual review.",
    feeNotes: "Flat advisory fee unchanged.",
    contractRenewalDate: "2026-07-01",
    nextAction: "Review renewal program before storm season.",
    performanceReviewed: false
  }
];

const propertyBase = [
  {
    id: "prop-westover",
    name: "Westover Flats",
    city: "Dallas",
    state: "TX",
    market: "Dallas-Fort Worth",
    type: "Multifamily",
    unitCount: 214,
    managerId: "mgr-bridge",
    ownershipEntity: "BH Sunbelt Housing I",
    occupancy: 91.2,
    leasedPercent: 93.5,
    averageRent: 1840,
    delinquencies: 2.3,
    turnTime: 24,
    adminCosts: 18250,
    budgetVsActual: -4.1,
    capexProgress: 58,
    noi: 328000,
    grossMonthlyRent: 394000,
    risk: "elevated",
    openIssues: 3,
    activeProjectStatus: "Clubhouse renovation delayed",
    lastReviewDate: "2026-04-07",
    nextActions: [
      "Escalate clubhouse contractor delay and refresh completion forecast.",
      "Review April leasing concessions against submarket comps.",
      "Confirm whether admin fee increase should be rejected."
    ],
    keyRisks: [
      "Vacancy loss remains elevated on upgraded two-bed units.",
      "Project schedule drift could affect summer leasing velocity."
    ],
    summary:
      "Stabilized multifamily asset with healthy demand, but turnover and renovation sequencing are limiting rent lift.",
    debtStatus: "Agency debt fixed through 2029; no near-term maturity.",
    renewalCount: 19,
    performance: monthlySeries({
      performance: [68, 70, 72, 73, 74, 74, 75, 76, 76, 77],
      occupancy: [89.8, 90.2, 90.9, 91.5, 92, 92.1, 91.8, 91.1, 91, 91.2],
      collected: [386, 388, 392, 396, 398, 401, 399, 397, 396, 394],
      budget: [392, 392, 394, 394, 396, 396, 398, 398, 400, 400],
      revenue: [420, 422, 425, 427, 431, 433, 432, 431, 430, 429],
      expenses: [112, 111, 113, 114, 115, 116, 118, 117, 118, 121],
      noi: [308, 311, 312, 313, 316, 317, 314, 314, 312, 308],
      turnDays: [29, 28, 27, 27, 26, 25, 25, 24, 24, 24],
      vacancyRate: [10.2, 9.8, 9.1, 8.5, 8, 7.9, 8.2, 8.9, 9, 8.8]
    }),
    managerReview: {
      reportingTimeliness: "watch",
      occupancyManagement: "watch",
      rentGrowthExecution: "watch",
      turnTimeEfficiency: "good",
      expenseDiscipline: "alert",
      capexExecution: "alert",
      communicationQuality: "good",
      issueResolutionSpeed: "watch",
      feeFairness: "alert",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Manager remains responsive, but April package was two business days late and admin add-ons require benchmark support.",
      feeNotes:
        "Questionable administrative fee escalation tied to renovation oversight; recommend written justification before approval."
    }
  },
  {
    id: "prop-harbor",
    name: "Harbor Row Residences",
    city: "Tampa",
    state: "FL",
    market: "Tampa",
    type: "Multifamily",
    unitCount: 168,
    managerId: "mgr-millstone",
    ownershipEntity: "BH Coastal Income",
    occupancy: 96.4,
    leasedPercent: 97.2,
    averageRent: 1960,
    delinquencies: 1.1,
    turnTime: 18,
    adminCosts: 13100,
    budgetVsActual: 2.2,
    capexProgress: 73,
    noi: 285000,
    grossMonthlyRent: 329000,
    risk: "low",
    openIssues: 1,
    activeProjectStatus: "Fitness center refresh on track",
    lastReviewDate: "2026-04-09",
    nextActions: ["Monitor insurance renewal options before June bind date."],
    keyRisks: ["Insurance premium pressure due to coastal exposure."],
    summary:
      "High-performing multifamily asset with disciplined operations and steady occupancy above target.",
    debtStatus: "Bank debt matures in 2028; covenant headroom remains healthy.",
    renewalCount: 14,
    performance: monthlySeries({
      performance: [78, 79, 80, 82, 83, 84, 85, 86, 86, 87],
      occupancy: [95.4, 95.6, 95.8, 96, 96.1, 96.3, 96.4, 96.6, 96.5, 96.4],
      collected: [318, 320, 322, 324, 325, 326, 327, 329, 329, 329],
      budget: [314, 315, 316, 318, 318, 320, 321, 322, 323, 324],
      revenue: [343, 344, 346, 349, 350, 352, 353, 354, 355, 355],
      expenses: [66, 66, 67, 68, 68, 69, 69, 69, 70, 70],
      noi: [277, 278, 279, 281, 282, 283, 284, 285, 285, 285],
      turnDays: [22, 21, 21, 20, 20, 19, 19, 18, 18, 18],
      vacancyRate: [4.6, 4.4, 4.2, 4, 3.9, 3.7, 3.6, 3.4, 3.5, 3.6]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "good",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Consistent, well-supported reporting and clean follow-through on owner questions. Benchmark as operating standard.",
      feeNotes: "Management and leasing fees remain within approved schedule."
    }
  },
  {
    id: "prop-meridian",
    name: "Meridian Centre",
    city: "Atlanta",
    state: "GA",
    market: "Atlanta",
    type: "Office",
    unitCount: 18,
    managerId: "mgr-sterling",
    ownershipEntity: "BH Office Holdings",
    occupancy: 82.7,
    leasedPercent: 84.1,
    averageRent: 31,
    delinquencies: 0.7,
    turnTime: 61,
    adminCosts: 24400,
    budgetVsActual: -6.8,
    capexProgress: 46,
    noi: 412000,
    grossMonthlyRent: 538000,
    risk: "critical",
    openIssues: 4,
    activeProjectStatus: "Lobby repositioning over budget",
    lastReviewDate: "2026-04-02",
    nextActions: [
      "Approve refinance strategy memo before May lender outreach.",
      "Challenge below-market leasing assumptions with broker.",
      "Review project change orders above approved contingency."
    ],
    keyRisks: [
      "Debt maturity within 11 months without a finalized refinance path.",
      "Leasing velocity trails underwritten pace after amenity upgrade."
    ],
    summary:
      "Institutional office asset requiring close attention to refinance timing, leasing strategy, and capex discipline.",
    debtStatus: "CMBS debt matures March 2027; refinance workstream is urgent.",
    renewalCount: 3,
    performance: monthlySeries({
      performance: [74, 73, 72, 71, 70, 69, 68, 67, 66, 65],
      occupancy: [86.2, 85.8, 85.4, 84.9, 84.5, 84.1, 83.7, 83.4, 83, 82.7],
      collected: [566, 563, 560, 554, 551, 547, 545, 541, 539, 538],
      budget: [575, 575, 575, 574, 574, 573, 572, 570, 570, 570],
      revenue: [612, 608, 604, 599, 595, 591, 588, 584, 581, 578],
      expenses: [169, 170, 171, 173, 174, 175, 176, 178, 179, 181],
      noi: [443, 438, 433, 426, 421, 416, 412, 406, 402, 397],
      turnDays: [54, 55, 56, 57, 58, 59, 60, 61, 61, 61],
      vacancyRate: [13.8, 14.2, 14.6, 15.1, 15.5, 15.9, 16.3, 16.6, 17, 17.3]
    }),
    managerReview: {
      reportingTimeliness: "alert",
      occupancyManagement: "alert",
      rentGrowthExecution: "alert",
      turnTimeEfficiency: "watch",
      expenseDiscipline: "watch",
      capexExecution: "alert",
      communicationQuality: "watch",
      issueResolutionSpeed: "alert",
      feeFairness: "watch",
      annualSiteVisitComplete: false,
      reviewerNotes:
        "Urgent oversight required. Reporting package has become narrative-heavy while leasing and refinance milestones remain underdeveloped.",
      feeNotes:
        "Leasing support fees may be acceptable, but only if paired with credible broker performance improvement."
    }
  },
  {
    id: "prop-dunlin",
    name: "Dunlin Shops",
    city: "Phoenix",
    state: "AZ",
    market: "Phoenix",
    type: "Retail",
    unitCount: 27,
    managerId: "mgr-sterling",
    ownershipEntity: "BH Retail Partners",
    occupancy: 88.9,
    leasedPercent: 90.1,
    averageRent: 28,
    delinquencies: 1.8,
    turnTime: 42,
    adminCosts: 11800,
    budgetVsActual: -2.5,
    capexProgress: 36,
    noi: 214000,
    grossMonthlyRent: 282000,
    risk: "elevated",
    openIssues: 2,
    activeProjectStatus: "Pad conversion awaiting owner decision",
    lastReviewDate: "2026-03-26",
    nextActions: [
      "Approve or pause pad conversion after updated leasing analysis.",
      "Press CAM specialist for reconciliation timing."
    ],
    keyRisks: [
      "Inline vacancy extended beyond target marketing window.",
      "CAM review delay affects recoverability confidence."
    ],
    summary:
      "Neighborhood retail center with resilient traffic but below-target leasing momentum on smaller suites.",
    debtStatus: "Regional bank debt fixed through 2028.",
    renewalCount: 6,
    performance: monthlySeries({
      performance: [71, 72, 72, 73, 73, 72, 72, 71, 70, 70],
      occupancy: [90.2, 90.4, 90.1, 89.8, 89.6, 89.3, 89.2, 89.1, 89, 88.9],
      collected: [286, 286, 287, 287, 286, 285, 284, 283, 282, 282],
      budget: [288, 288, 289, 289, 289, 289, 288, 288, 288, 288],
      revenue: [305, 305, 306, 306, 305, 304, 303, 302, 301, 300],
      expenses: [86, 85, 86, 86, 86, 87, 88, 88, 87, 86],
      noi: [219, 220, 220, 220, 219, 217, 215, 214, 214, 214],
      turnDays: [40, 41, 41, 42, 42, 42, 43, 43, 42, 42],
      vacancyRate: [9.8, 9.6, 9.9, 10.2, 10.4, 10.7, 10.8, 10.9, 11, 11.1]
    }),
    managerReview: {
      reportingTimeliness: "watch",
      occupancyManagement: "watch",
      rentGrowthExecution: "watch",
      turnTimeEfficiency: "watch",
      expenseDiscipline: "good",
      capexExecution: "watch",
      communicationQuality: "good",
      issueResolutionSpeed: "watch",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Solid stewardship but lacking urgency on backfilling smaller suites and coordinating CAM support.",
      feeNotes: "Base fee acceptable; monitor project oversight add-ons if pad conversion proceeds."
    }
  },
  {
    id: "prop-yard",
    name: "Yardline Logistics Park",
    city: "Columbus",
    state: "OH",
    market: "Columbus",
    type: "Industrial",
    unitCount: 9,
    managerId: "mgr-sterling",
    ownershipEntity: "BH Industrial Fund",
    occupancy: 97.8,
    leasedPercent: 98.3,
    averageRent: 8.4,
    delinquencies: 0,
    turnTime: 17,
    adminCosts: 9800,
    budgetVsActual: 3.9,
    capexProgress: 64,
    noi: 338000,
    grossMonthlyRent: 362000,
    risk: "moderate",
    openIssues: 1,
    activeProjectStatus: "Truck court resurfacing on track",
    lastReviewDate: "2026-04-01",
    nextActions: ["Complete cost segregation delivery and fold into tax plan."],
    keyRisks: ["Single-tenant rollover concentration in early 2027."],
    summary:
      "Strong industrial asset with high occupancy and stable cash flow; forward risk is lease concentration rather than operations.",
    debtStatus: "Life company loan matures 2030.",
    renewalCount: 1,
    performance: monthlySeries({
      performance: [82, 82, 83, 84, 84, 85, 85, 86, 86, 86],
      occupancy: [97, 97, 97.2, 97.2, 97.4, 97.5, 97.6, 97.8, 97.8, 97.8],
      collected: [349, 350, 351, 352, 353, 354, 356, 359, 360, 362],
      budget: [342, 343, 344, 345, 346, 347, 349, 350, 351, 352],
      revenue: [368, 369, 370, 371, 372, 373, 374, 376, 377, 378],
      expenses: [38, 38, 38, 39, 39, 39, 39, 40, 40, 40],
      noi: [330, 331, 332, 332, 333, 334, 335, 336, 337, 338],
      turnDays: [18, 18, 18, 17, 17, 17, 17, 17, 17, 17],
      vacancyRate: [3, 3, 2.8, 2.8, 2.6, 2.5, 2.4, 2.2, 2.2, 2.2]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "good",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Operations are steady and disciplined. Keep attention on lease rollover planning rather than day-to-day management.",
      feeNotes: "No fee anomalies."
    }
  },
  {
    id: "prop-lark",
    name: "Larkspur Tower",
    city: "Seattle",
    state: "WA",
    market: "Seattle",
    type: "Office",
    unitCount: 14,
    managerId: "mgr-crescent",
    ownershipEntity: "BH Pacific Office",
    occupancy: 93.6,
    leasedPercent: 95.1,
    averageRent: 36,
    delinquencies: 0.4,
    turnTime: 33,
    adminCosts: 17600,
    budgetVsActual: 1.5,
    capexProgress: 82,
    noi: 374000,
    grossMonthlyRent: 442000,
    risk: "low",
    openIssues: 0,
    activeProjectStatus: "Spec suite rollout ahead of plan",
    lastReviewDate: "2026-04-11",
    nextActions: ["Prepare annual site visit memo for trustee packet."],
    keyRisks: ["Monitor tenant improvement spend if leasing pace accelerates."],
    summary:
      "Well-managed boutique office tower outperforming assumptions in a selective market.",
    debtStatus: "Floating-rate loan hedged through 2027.",
    renewalCount: 2,
    performance: monthlySeries({
      performance: [79, 80, 81, 82, 83, 84, 84, 85, 86, 86],
      occupancy: [92.4, 92.6, 92.8, 93, 93.1, 93.2, 93.4, 93.5, 93.6, 93.6],
      collected: [425, 427, 429, 431, 433, 434, 436, 438, 440, 442],
      budget: [418, 419, 420, 421, 422, 424, 425, 426, 427, 428],
      revenue: [458, 460, 461, 463, 465, 466, 468, 469, 471, 472],
      expenses: [93, 93, 93, 93, 93, 92, 92, 94, 96, 98],
      noi: [365, 367, 368, 370, 372, 374, 376, 375, 375, 374],
      turnDays: [37, 36, 35, 35, 35, 34, 34, 33, 33, 33],
      vacancyRate: [7.6, 7.4, 7.2, 7, 6.9, 6.8, 6.6, 6.5, 6.4, 6.4]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "good",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Best-in-class reporting and leasing preparation. Use as model for office assets needing tighter landlord representation.",
      feeNotes: "Premium fee is supported by execution quality."
    }
  },
  {
    id: "prop-sable",
    name: "Sable Pointe",
    city: "Austin",
    state: "TX",
    market: "Austin",
    type: "Multifamily",
    unitCount: 142,
    managerId: "mgr-bridge",
    ownershipEntity: "BH Sunbelt Housing I",
    occupancy: 89.5,
    leasedPercent: 91.7,
    averageRent: 2015,
    delinquencies: 1.6,
    turnTime: 27,
    adminCosts: 14600,
    budgetVsActual: -3.2,
    capexProgress: 51,
    noi: 244000,
    grossMonthlyRent: 301000,
    risk: "elevated",
    openIssues: 2,
    activeProjectStatus: "Model unit refresh behind schedule",
    lastReviewDate: "2026-04-04",
    nextActions: [
      "Review under-market renewal growth against Austin peer set.",
      "Assess whether slow model refresh is affecting conversion."
    ],
    keyRisks: ["Renewal rent growth below market despite strong submarket demand."],
    summary:
      "A good asset in a healthy market, but current manager execution is leaving revenue on the table.",
    debtStatus: "Fixed-rate bank debt matures 2029.",
    renewalCount: 16,
    performance: monthlySeries({
      performance: [70, 71, 72, 71, 71, 70, 69, 69, 68, 68],
      occupancy: [91.4, 91.2, 91.1, 90.8, 90.5, 90.2, 89.9, 89.8, 89.6, 89.5],
      collected: [307, 306, 305, 304, 304, 303, 302, 301, 301, 301],
      budget: [311, 311, 311, 311, 311, 310, 309, 309, 309, 309],
      revenue: [325, 324, 323, 322, 321, 319, 318, 317, 316, 315],
      expenses: [69, 69, 70, 70, 70, 71, 71, 72, 72, 71],
      noi: [256, 255, 253, 252, 251, 248, 247, 245, 244, 244],
      turnDays: [30, 30, 29, 29, 28, 28, 28, 27, 27, 27],
      vacancyRate: [8.6, 8.8, 8.9, 9.2, 9.5, 9.8, 10.1, 10.2, 10.4, 10.5]
    }),
    managerReview: {
      reportingTimeliness: "watch",
      occupancyManagement: "watch",
      rentGrowthExecution: "alert",
      turnTimeEfficiency: "good",
      expenseDiscipline: "watch",
      capexExecution: "watch",
      communicationQuality: "good",
      issueResolutionSpeed: "watch",
      feeFairness: "watch",
      annualSiteVisitComplete: false,
      reviewerNotes:
        "The main concern is muted rent growth rather than pure occupancy. Owner should press for a sharper renewal and unit upgrade strategy.",
      feeNotes: "Current fees acceptable, but incentive comp should be tied to achieved rent growth."
    }
  },
  {
    id: "prop-ridge",
    name: "Ridgeview Commons",
    city: "Charlotte",
    state: "NC",
    market: "Charlotte",
    type: "Retail",
    unitCount: 21,
    managerId: "mgr-millstone",
    ownershipEntity: "BH Retail Partners",
    occupancy: 94.1,
    leasedPercent: 94.1,
    averageRent: 25,
    delinquencies: 0.9,
    turnTime: 31,
    adminCosts: 9300,
    budgetVsActual: 0.8,
    capexProgress: 67,
    noi: 189000,
    grossMonthlyRent: 228000,
    risk: "moderate",
    openIssues: 1,
    activeProjectStatus: "Parking lot resurfacing closing out",
    lastReviewDate: "2026-04-12",
    nextActions: ["Confirm broker recommendation for upcoming anchor renewal."],
    keyRisks: ["Anchor renewal package due within 90 days."],
    summary:
      "Stable grocery-anchored retail center with predictable cash flow and one key anchor decision approaching.",
    debtStatus: "Debt maturity 2028; no immediate concern.",
    renewalCount: 4,
    performance: monthlySeries({
      performance: [77, 77, 78, 78, 79, 80, 80, 80, 81, 81],
      occupancy: [93.1, 93.1, 93.4, 93.5, 93.7, 93.8, 93.9, 94, 94.1, 94.1],
      collected: [221, 222, 223, 223, 224, 225, 226, 227, 228, 228],
      budget: [220, 220, 221, 221, 222, 222, 223, 223, 224, 224],
      revenue: [242, 242, 243, 244, 244, 245, 246, 246, 247, 247],
      expenses: [58, 58, 58, 58, 58, 58, 58, 59, 59, 59],
      noi: [184, 184, 185, 186, 186, 187, 188, 187, 188, 188],
      turnDays: [33, 33, 32, 32, 32, 31, 31, 31, 31, 31],
      vacancyRate: [6.9, 6.9, 6.6, 6.5, 6.3, 6.2, 6.1, 6, 5.9, 5.9]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "good",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes: "Dependable manager with appropriate escalation discipline.",
      feeNotes: "No issues."
    }
  },
  {
    id: "prop-copper",
    name: "Copperline Plaza",
    city: "Denver",
    state: "CO",
    market: "Denver",
    type: "Retail",
    unitCount: 16,
    managerId: "mgr-millstone",
    ownershipEntity: "BH Retail Partners",
    occupancy: 86.2,
    leasedPercent: 88.4,
    averageRent: 27,
    delinquencies: 2,
    turnTime: 39,
    adminCosts: 10100,
    budgetVsActual: -1.8,
    capexProgress: 41,
    noi: 171000,
    grossMonthlyRent: 211000,
    risk: "elevated",
    openIssues: 2,
    activeProjectStatus: "Facade repair delayed by permit revision",
    lastReviewDate: "2026-04-06",
    nextActions: ["Escalate permit timeline and reforecast leasing start date."],
    keyRisks: ["Vacant corner suite has been dark for 143 days."],
    summary:
      "Well-located center with one prolonged vacancy and a project delay affecting merchandising strength.",
    debtStatus: "Debt matures 2029.",
    renewalCount: 2,
    performance: monthlySeries({
      performance: [69, 69, 68, 68, 67, 67, 66, 65, 64, 64],
      occupancy: [89.1, 88.8, 88.3, 88, 87.7, 87.3, 87, 86.7, 86.4, 86.2],
      collected: [216, 215, 214, 214, 213, 213, 212, 211, 211, 211],
      budget: [219, 219, 219, 219, 219, 218, 218, 218, 218, 218],
      revenue: [228, 227, 226, 225, 224, 223, 222, 220, 219, 218],
      expenses: [48, 48, 49, 49, 49, 50, 50, 50, 49, 47],
      noi: [180, 179, 177, 176, 175, 173, 172, 170, 170, 171],
      turnDays: [35, 36, 36, 37, 37, 38, 39, 39, 39, 39],
      vacancyRate: [10.9, 11.2, 11.7, 12, 12.3, 12.7, 13, 13.3, 13.6, 13.8]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "watch",
      rentGrowthExecution: "watch",
      turnTimeEfficiency: "watch",
      expenseDiscipline: "good",
      capexExecution: "watch",
      communicationQuality: "good",
      issueResolutionSpeed: "watch",
      feeFairness: "good",
      annualSiteVisitComplete: false,
      reviewerNotes:
        "Need a tighter recovery plan for the dark corner space and more visible permit management.",
      feeNotes: "No fee concern today."
    }
  },
  {
    id: "prop-canal",
    name: "Canal Street Lofts",
    city: "New Orleans",
    state: "LA",
    market: "New Orleans",
    type: "Multifamily",
    unitCount: 98,
    managerId: "mgr-crescent",
    ownershipEntity: "BH Urban Multifamily",
    occupancy: 92.6,
    leasedPercent: 94.4,
    averageRent: 2180,
    delinquencies: 1.5,
    turnTime: 23,
    adminCosts: 11900,
    budgetVsActual: 1.1,
    capexProgress: 48,
    noi: 201000,
    grossMonthlyRent: 239000,
    risk: "moderate",
    openIssues: 1,
    activeProjectStatus: "Insurance claim close-out pending",
    lastReviewDate: "2026-04-10",
    nextActions: ["Review insurance settlement timing and reserve release."],
    keyRisks: ["Potential weather-related premium increase at renewal."],
    summary:
      "Urban multifamily asset with strong leasing tone and limited operational noise.",
    debtStatus: "Bank debt matures 2028.",
    renewalCount: 8,
    performance: monthlySeries({
      performance: [75, 75, 76, 77, 77, 78, 79, 80, 80, 80],
      occupancy: [91.1, 91.3, 91.6, 91.8, 92, 92.1, 92.3, 92.4, 92.5, 92.6],
      collected: [231, 232, 233, 234, 235, 236, 237, 238, 239, 239],
      budget: [229, 229, 230, 230, 231, 231, 232, 232, 233, 233],
      revenue: [249, 250, 251, 252, 253, 254, 255, 256, 257, 257],
      expenses: [39, 39, 39, 39, 39, 40, 40, 40, 40, 38],
      noi: [210, 211, 212, 213, 214, 214, 215, 216, 217, 219],
      turnDays: [25, 25, 24, 24, 24, 24, 23, 23, 23, 23],
      vacancyRate: [8.9, 8.7, 8.4, 8.2, 8, 7.9, 7.7, 7.6, 7.5, 7.4]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "watch",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes: "Strong execution; only monitor insurance close-out timing.",
      feeNotes: "No concerns."
    }
  },
  {
    id: "prop-atelier",
    name: "Atelier Park",
    city: "San Diego",
    state: "CA",
    market: "San Diego",
    type: "Office",
    unitCount: 11,
    managerId: "mgr-crescent",
    ownershipEntity: "BH Pacific Office",
    occupancy: 95.3,
    leasedPercent: 96.1,
    averageRent: 39,
    delinquencies: 0.3,
    turnTime: 29,
    adminCosts: 16100,
    budgetVsActual: 2.6,
    capexProgress: 71,
    noi: 291000,
    grossMonthlyRent: 338000,
    risk: "low",
    openIssues: 0,
    activeProjectStatus: "Roof warranty work closing out",
    lastReviewDate: "2026-04-13",
    nextActions: ["Package Q2 leasing memo for trustee review."],
    keyRisks: ["Minimal near-term risk; monitor one 2027 renewal cluster."],
    summary:
      "High-quality office asset with disciplined execution and strong tenant retention.",
    debtStatus: "No near-term debt concerns.",
    renewalCount: 2,
    performance: monthlySeries({
      performance: [81, 82, 82, 83, 84, 84, 85, 86, 87, 87],
      occupancy: [94.2, 94.3, 94.5, 94.6, 94.8, 94.9, 95, 95.1, 95.2, 95.3],
      collected: [327, 328, 329, 330, 332, 333, 334, 336, 337, 338],
      budget: [322, 322, 323, 323, 324, 325, 326, 327, 328, 329],
      revenue: [349, 350, 351, 352, 353, 354, 355, 356, 357, 358],
      expenses: [48, 48, 48, 48, 49, 49, 49, 49, 49, 47],
      noi: [301, 302, 303, 304, 304, 305, 306, 307, 308, 311],
      turnDays: [32, 32, 31, 31, 31, 30, 30, 29, 29, 29],
      vacancyRate: [5.8, 5.7, 5.5, 5.4, 5.2, 5.1, 5, 4.9, 4.8, 4.7]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "good",
      capexExecution: "good",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "good",
      annualSiteVisitComplete: true,
      reviewerNotes: "Low-noise asset with clear communications and clean budgeting.",
      feeNotes: "No concerns."
    }
  },
  {
    id: "prop-ashton",
    name: "Ashton Court",
    city: "Nashville",
    state: "TN",
    market: "Nashville",
    type: "Multifamily",
    unitCount: 126,
    managerId: "mgr-bridge",
    ownershipEntity: "BH Urban Multifamily",
    occupancy: 94.8,
    leasedPercent: 95.4,
    averageRent: 1765,
    delinquencies: 1.2,
    turnTime: 21,
    adminCosts: 12800,
    budgetVsActual: 0.5,
    capexProgress: 62,
    noi: 233000,
    grossMonthlyRent: 276000,
    risk: "moderate",
    openIssues: 1,
    activeProjectStatus: "Exterior paint complete; punch list active",
    lastReviewDate: "2026-04-05",
    nextActions: ["Validate final capex close-out and reserve release."],
    keyRisks: ["Monitor fees after project completion to avoid lingering charges."],
    summary:
      "Healthy multifamily asset with one oversight item around project close-out and post-project billing.",
    debtStatus: "Agency debt fixed through 2030.",
    renewalCount: 11,
    performance: monthlySeries({
      performance: [74, 75, 75, 76, 77, 78, 78, 79, 79, 80],
      occupancy: [93.8, 94, 94.1, 94.2, 94.3, 94.4, 94.5, 94.6, 94.7, 94.8],
      collected: [269, 270, 271, 272, 273, 274, 275, 275, 276, 276],
      budget: [267, 267, 268, 268, 269, 269, 270, 270, 271, 271],
      revenue: [289, 290, 291, 292, 293, 294, 295, 296, 297, 297],
      expenses: [44, 44, 44, 44, 44, 45, 45, 46, 46, 43],
      noi: [245, 246, 247, 248, 249, 249, 250, 250, 251, 254],
      turnDays: [24, 24, 24, 23, 23, 22, 22, 22, 21, 21],
      vacancyRate: [6.2, 6, 5.9, 5.8, 5.7, 5.6, 5.5, 5.4, 5.3, 5.2]
    }),
    managerReview: {
      reportingTimeliness: "good",
      occupancyManagement: "good",
      rentGrowthExecution: "good",
      turnTimeEfficiency: "good",
      expenseDiscipline: "watch",
      capexExecution: "watch",
      communicationQuality: "good",
      issueResolutionSpeed: "good",
      feeFairness: "watch",
      annualSiteVisitComplete: true,
      reviewerNotes:
        "Property is in good shape. Keep a close eye on whether project-related charges truly roll off after punch list completion.",
      feeNotes: "Request final fee normalization memo in May."
    }
  }
] satisfies Omit<Property, "slug" | "serviceProviderIds" | "scoreInputs" | "expenseCategories" | "oversightContacts">[];

export const properties: Property[] = propertyBase.map((property, index) => {
  const defaultProviders =
    property.type === "Multifamily"
      ? ["prov-grant", "prov-aegis", "prov-hawthorne"]
      : ["prov-anchor", "prov-marlow", "prov-hawthorne"];

  const specialistProviders =
    property.id === "prop-meridian"
      ? ["prov-citadel", "prov-aegis"]
      : property.id === "prop-yard"
        ? ["prov-lineage", "prov-anchor"]
        : property.id === "prop-dunlin" || property.id === "prop-copper"
          ? ["prov-camber", "prov-marlow"]
          : property.id === "prop-canal"
            ? ["prov-cedar", "prov-aegis"]
            : property.id === "prop-ashton"
        ? ["prov-lineage"]
              : [];

  const serviceProviderIds = Array.from(
    new Set([...defaultProviders, ...specialistProviders, property.managerId])
  );
  const managerName = managers.find((manager) => manager.id === property.managerId)?.name ?? "Property manager";

  return {
    ...property,
    slug: slugify(property.name),
    serviceProviderIds,
    scoreInputs: deriveScoreInputs(property),
    expenseCategories: deriveExpenseCategories(property),
    oversightContacts: deriveOversightContacts(property, managerName, serviceProviderIds),
    id: property.id ?? `property-${index}`
  };
});

export const issues: Issue[] = [
  {
    id: "issue-1",
    propertyId: "prop-meridian",
    title: "Refinance strategy unresolved",
    detail: "Debt maturity is March 2027 and lender outreach memo is still draft-level.",
    severity: "critical",
    category: "debt",
    owner: "Capital markets lead",
    dueDate: "2026-05-06",
    status: "Escalated"
  },
  {
    id: "issue-2",
    propertyId: "prop-westover",
    title: "Clubhouse renovation slipped three weeks",
    detail: "Contractor sequencing delay may affect summer leasing conversion.",
    severity: "elevated",
    category: "capex",
    owner: "Owner rep",
    dueDate: "2026-04-25",
    status: "Escalated"
  },
  {
    id: "issue-3",
    propertyId: "prop-sable",
    title: "Rent growth trailing market",
    detail: "Renewal offers are averaging 2.1% versus 4.4% peer benchmark.",
    severity: "elevated",
    category: "leasing",
    owner: "Asset manager",
    dueDate: "2026-04-30",
    status: "Open"
  },
  {
    id: "issue-4",
    propertyId: "prop-westover",
    title: "Administrative fee increase lacks support",
    detail: "Property manager added project administration charges without prior owner approval.",
    severity: "elevated",
    category: "fees",
    owner: "Controller",
    dueDate: "2026-04-24",
    status: "Open"
  },
  {
    id: "issue-5",
    propertyId: "prop-copper",
    title: "Corner vacancy exceeds 140 days",
    detail: "Leasing outreach exists, but there is no refreshed pricing or concession strategy.",
    severity: "elevated",
    category: "vacancy",
    owner: "Leasing advisor",
    dueDate: "2026-05-02",
    status: "Watching"
  },
  {
    id: "issue-6",
    propertyId: "prop-dunlin",
    title: "CAM reconciliation package late",
    detail: "Delay reduces confidence in recovery estimates and tenant true-up timing.",
    severity: "moderate",
    category: "reporting",
    owner: "CAM specialist",
    dueDate: "2026-04-27",
    status: "Watching"
  },
  {
    id: "issue-7",
    propertyId: "prop-meridian",
    title: "Lobby repositioning over contingency",
    detail: "Change orders have pushed the project 11% above approved budget.",
    severity: "critical",
    category: "capex",
    owner: "Projects lead",
    dueDate: "2026-04-23",
    status: "Escalated"
  },
  {
    id: "issue-8",
    propertyId: "prop-westover",
    title: "Reporting package missed deadline",
    detail: "April reporting arrived two business days late without explanation.",
    severity: "moderate",
    category: "reporting",
    owner: "Operations lead",
    dueDate: "2026-04-22",
    status: "Watching"
  },
  {
    id: "issue-9",
    propertyId: "prop-meridian",
    title: "Under-market leasing proposal",
    detail: "Broker proposal is 6% below best recent comp set for similar suites.",
    severity: "elevated",
    category: "leasing",
    owner: "Broker",
    dueDate: "2026-04-29",
    status: "Open"
  },
  {
    id: "issue-10",
    propertyId: "prop-canal",
    title: "Insurance claim reserve not released",
    detail: "Carrier is requesting one more contractor certification before closing the file.",
    severity: "moderate",
    category: "fees",
    owner: "Insurance advisor",
    dueDate: "2026-05-09",
    status: "Watching"
  }
];

export const projects: CapexProject[] = [
  {
    id: "proj-1",
    propertyId: "prop-westover",
    name: "Clubhouse renovation",
    status: "Delayed",
    budget: 860000,
    actual: 704000,
    progress: 58,
    timeline: "Targeted completion June 2026",
    ownerDecision: "Approve revised contractor schedule or rebid final finishes."
  },
  {
    id: "proj-2",
    propertyId: "prop-meridian",
    name: "Lobby repositioning program",
    status: "Over budget",
    budget: 1450000,
    actual: 1610000,
    progress: 46,
    timeline: "Substantial completion August 2026",
    ownerDecision: "Authorize reduced finish package or fund overage from reserves."
  },
  {
    id: "proj-3",
    propertyId: "prop-dunlin",
    name: "Pad conversion analysis",
    status: "Needs decision",
    budget: 540000,
    actual: 118000,
    progress: 36,
    timeline: "Decision gate by May 15, 2026",
    ownerDecision: "Choose between medical conversion, restaurant re-tenanting, or hold strategy."
  },
  {
    id: "proj-4",
    propertyId: "prop-copper",
    name: "Facade repair and signage reset",
    status: "Delayed",
    budget: 320000,
    actual: 161000,
    progress: 41,
    timeline: "Permit revision pushed finish to July 2026",
    ownerDecision: "Approve interim leasing package while facade work remains open."
  },
  {
    id: "proj-5",
    propertyId: "prop-harbor",
    name: "Fitness center refresh",
    status: "On track",
    budget: 270000,
    actual: 197000,
    progress: 73,
    timeline: "Delivery May 2026",
    ownerDecision: "No action needed."
  },
  {
    id: "proj-6",
    propertyId: "prop-yard",
    name: "Truck court resurfacing",
    status: "On track",
    budget: 430000,
    actual: 275000,
    progress: 64,
    timeline: "Close-out June 2026",
    ownerDecision: "No action needed."
  }
];

export const tasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Review property manager reporting timeliness",
    cadence: "Monthly",
    owner: "Operations lead",
    dueDate: "2026-04-22",
    status: "Open",
    propertyId: "prop-westover",
    providerId: "mgr-bridge",
    decisionNeeded: "Determine whether to issue a formal service-level warning."
  },
  {
    id: "task-2",
    title: "Review occupancy and leasing velocity",
    cadence: "Monthly",
    owner: "Asset manager",
    dueDate: "2026-04-26",
    status: "In progress",
    propertyId: "prop-meridian",
    providerId: "prov-marlow",
    decisionNeeded: "Approve revised leasing assumptions."
  },
  {
    id: "task-3",
    title: "Inspect rent increase cadence",
    cadence: "Monthly",
    owner: "Owner rep",
    dueDate: "2026-04-29",
    status: "Open",
    propertyId: "prop-sable",
    providerId: "mgr-bridge",
    decisionNeeded: "Require a revised renewal pricing ladder."
  },
  {
    id: "task-4",
    title: "Review admin cost anomalies",
    cadence: "Monthly",
    owner: "Controller",
    dueDate: "2026-04-24",
    status: "Open",
    propertyId: "prop-westover",
    providerId: "mgr-bridge",
    decisionNeeded: "Approve or reject additional project admin fees."
  },
  {
    id: "task-5",
    title: "Confirm K-1 and CPA fee posture",
    cadence: "Quarterly",
    owner: "Tax director",
    dueDate: "2026-05-18",
    status: "In progress",
    providerId: "prov-grant",
    decisionNeeded: "Approve 2026 tax planning scope."
  },
  {
    id: "task-6",
    title: "Annual site visit",
    cadence: "Annual",
    owner: "Trust officer",
    dueDate: "2026-06-12",
    status: "Open",
    propertyId: "prop-meridian",
    decisionNeeded: "Confirm visit objectives and attendee list."
  },
  {
    id: "task-7",
    title: "Debt maturity review",
    cadence: "Quarterly",
    owner: "Capital markets lead",
    dueDate: "2026-05-06",
    status: "Open",
    propertyId: "prop-meridian",
    providerId: "prov-citadel",
    decisionNeeded: "Choose refinance path and lender set."
  },
  {
    id: "task-8",
    title: "Insurance review",
    cadence: "Annual",
    owner: "Risk lead",
    dueDate: "2026-06-03",
    status: "Open",
    providerId: "prov-aegis",
    decisionNeeded: "Approve deductible and limit recommendations."
  },
  {
    id: "task-9",
    title: "Capex variance review",
    cadence: "Monthly",
    owner: "Projects lead",
    dueDate: "2026-04-23",
    status: "Open",
    propertyId: "prop-meridian",
    decisionNeeded: "Authorize budget reset or scope reduction."
  },
  {
    id: "task-10",
    title: "Trustee fiduciary exception review",
    cadence: "Trustee",
    owner: "Trust officer",
    dueDate: "2026-05-10",
    status: "Open",
    propertyId: "prop-westover",
    decisionNeeded: "Document why fee challenge and project delay are appropriately managed."
  },
  {
    id: "task-11",
    title: "Review CAM true-up timing",
    cadence: "Quarterly",
    owner: "Retail lead",
    dueDate: "2026-05-01",
    status: "Open",
    propertyId: "prop-dunlin",
    providerId: "prov-camber",
    decisionNeeded: "Escalate specialist performance if packet remains late."
  },
  {
    id: "task-12",
    title: "Portfolio reporting package review",
    cadence: "Monthly",
    owner: "Family office analyst",
    dueDate: "2026-04-28",
    status: "In progress",
    decisionNeeded: "Clear report for trustee distribution."
  }
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-1",
    propertyId: "prop-westover",
    category: "Property Manager Report",
    title: "Westover Flats - April Manager Package",
    updatedAt: "2026-04-09",
    status: "Needs review",
    source: "Bridgeview Residential"
  },
  {
    id: "doc-2",
    propertyId: "prop-meridian",
    category: "Financial Statement",
    title: "Meridian Centre - March Operating Statement",
    updatedAt: "2026-04-04",
    status: "Current",
    source: "Sterling Commercial Advisors"
  },
  {
    id: "doc-3",
    propertyId: "prop-meridian",
    category: "Lender Doc",
    title: "Meridian Refinance Strategy Memo Draft",
    updatedAt: "2026-04-12",
    status: "Needs review",
    source: "Citadel Debt Advisory"
  },
  {
    id: "doc-4",
    propertyId: "prop-dunlin",
    category: "Inspection Report",
    title: "Dunlin Shops - Roof and Facade Inspection",
    updatedAt: "2026-03-28",
    status: "Current",
    source: "Sterling Commercial Advisors"
  },
  {
    id: "doc-5",
    propertyId: "prop-yard",
    category: "Tax Doc",
    title: "Yardline Logistics - Cost Seg Engagement Letter",
    updatedAt: "2026-02-19",
    status: "Current",
    source: "Lineage Cost Seg"
  },
  {
    id: "doc-6",
    propertyId: "prop-canal",
    category: "Insurance Doc",
    title: "Canal Street Lofts - Claim Reserve Tracker",
    updatedAt: "2026-04-08",
    status: "Needs review",
    source: "Aegis Risk Partners"
  },
  {
    id: "doc-7",
    category: "Trustee Memo",
    title: "Q2 Trustee Oversight Summary",
    updatedAt: "2026-04-15",
    status: "Current",
    source: "Amseta Oversight"
  },
  {
    id: "doc-8",
    propertyId: "prop-harbor",
    category: "Lease",
    title: "Harbor Row - Anchor Renewal Abstract",
    updatedAt: "2026-03-11",
    status: "Current",
    source: "Millstone Asset Services"
  },
  {
    id: "doc-9",
    propertyId: "prop-copper",
    category: "Property Manager Report",
    title: "Copperline Plaza - April Leasing Update",
    updatedAt: "2026-04-06",
    status: "Needs review",
    source: "Millstone Asset Services"
  },
  {
    id: "doc-10",
    propertyId: "prop-westover",
    category: "Trustee Memo",
    title: "Westover Fee Exception Note",
    updatedAt: "2026-04-16",
    status: "Current",
    source: "Amseta Oversight"
  }
];

export const notes: TimelineNote[] = [
  {
    id: "note-1",
    propertyId: "prop-meridian",
    author: "J. Reynolds",
    date: "2026-04-16",
    label: "Refinance",
    note: "Requested debt advisor to replace narrative memo with lender-ready decision grid by May 1."
  },
  {
    id: "note-2",
    propertyId: "prop-meridian",
    author: "S. Patel",
    date: "2026-04-11",
    label: "Leasing",
    note: "Broker guidance appears conservative relative to recent Midtown comps; follow-up requested."
  },
  {
    id: "note-3",
    propertyId: "prop-westover",
    author: "A. Chen",
    date: "2026-04-14",
    label: "Fees",
    note: "Admin fee increase flagged for trustee explanation unless manager provides support."
  },
  {
    id: "note-4",
    propertyId: "prop-westover",
    author: "A. Chen",
    date: "2026-04-08",
    label: "Capex",
    note: "Contractor acknowledged schedule slippage tied to millwork delivery; revised critical path requested."
  },
  {
    id: "note-5",
    propertyId: "prop-dunlin",
    author: "M. Ford",
    date: "2026-04-05",
    label: "CAM",
    note: "CAM specialist asked for one-week extension; owner team accepted with warning."
  },
  {
    id: "note-6",
    propertyId: "prop-canal",
    author: "R. Hale",
    date: "2026-04-09",
    label: "Insurance",
    note: "Carrier reserve release likely in May pending final contractor certification."
  }
];

export const dataset: PortfolioDataset = {
  properties,
  managers,
  providers,
  issues,
  tasks,
  projects,
  documents,
  notes
};

export const portfolioSummary = {
  totalProperties: properties.length,
  totalUnits: properties.reduce((sum, property) => sum + property.unitCount, 0),
  occupancyRate: properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length,
  grossMonthlyRent: properties.reduce((sum, property) => sum + property.grossMonthlyRent, 0),
  netOperatingIncome: properties.reduce((sum, property) => sum + property.noi, 0),
  criticalIssues: issues.filter((issue) => issue.severity === "critical" || issue.status === "Escalated").length,
  upcomingRenewals: properties.reduce((sum, property) => sum + property.renewalCount, 0),
  activeCapexProjects: projects.length
};

export const portfolioChart = properties[0].performance.map((point, index) => {
  const performance =
    properties.reduce((sum, property) => sum + property.performance[index].performance, 0) / properties.length;
  const occupancy =
    properties.reduce((sum, property) => sum + property.performance[index].occupancy, 0) / properties.length;
  const collected = properties.reduce((sum, property) => sum + property.performance[index].collected, 0);
  const budget = properties.reduce((sum, property) => sum + property.performance[index].budget, 0);

  return {
    month: point.month,
    performance: Number(performance.toFixed(1)),
    occupancy: Number(occupancy.toFixed(1)),
    collected,
    budget
  };
});

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getPropertyContext(propertyId: string) {
  return {
    issues: issues.filter((issue) => issue.propertyId === propertyId),
    projects: projects.filter((project) => project.propertyId === propertyId),
    documents: documents.filter((document) => document.propertyId === propertyId),
    notes: notes.filter((note) => note.propertyId === propertyId)
  };
}
