import type {
  Manager,
  PortfolioDataset,
  Property,
  PropertyScoreInputs,
  Provider,
  StatusTone
} from "@/lib/types";

export type HealthFactor = {
  key:
    | "noi"
    | "vacancy"
    | "agedReceivables"
    | "agedPayables"
    | "expenseConsistency"
    | "leaseStability";
  label: string;
  score: number;
  weight: number;
  tone: StatusTone;
  valueLabel: string;
  detail: string;
};

export type MonthlyOperatingReport = {
  currentNoi: number;
  annualizedNoi: number;
  vacancyRate: number;
  averageVacancyRate: number;
  agedReceivablesAmount: number;
  agedReceivablesDays: number;
  agedPayablesAmount: number;
  agedPayablesDays: number;
  ledgerSummary: Array<{
    label: string;
    value: number;
    detail: string;
  }>;
  expenseCategories: Array<{
    category: string;
    current: number;
    priorMonth: number;
    variancePercent: number;
    tone: StatusTone;
    review: string;
  }>;
};

export type DiagnosticFinding = {
  title: string;
  detail: string;
  tone: StatusTone;
  timeframe: string;
};

export type ServiceRecommendation = {
  title: string;
  detail: string;
  owner: string;
  urgency: "Immediate" | "This quarter" | "Monitor";
};

export type OversightReview = {
  title: string;
  detail: string;
  owner: string;
  tone: StatusTone;
};

export type ContactLine = {
  role: string;
  name: string;
  detail: string;
};

export type PropertyScoreboard = {
  propertyId: string;
  propertySlug: string;
  propertyName: string;
  market: string;
  healthScore: number;
  healthBand: "Excellent" | "Stable" | "Monitor" | "Intervention";
  healthTone: StatusTone;
  healthSummary: string;
  sameStorePerformance: number;
  trailingTwelveNoi: number;
  managementAgreementLabel: string;
  factors: HealthFactor[];
  monthlyOperatingReport: MonthlyOperatingReport;
  diagnostics: {
    findings: DiagnosticFinding[];
    priorMonthChange: number;
    quarterlyChange: number;
    trailingTwelveChange: number;
  };
  oversight: OversightReview[];
  services: ServiceRecommendation[];
  contacts: ContactLine[];
};

export type PortfolioScoreboard = {
  portfolioHealthScore: number;
  healthBand: "Excellent" | "Stable" | "Monitor" | "Intervention";
  managementAgreements: number;
  propertyCount: number;
  fundsFromOperations: number;
  sameStorePerformance: number;
  trailingTwelveNoi: number;
  totalReceivablesExposure: number;
  totalPayablesExposure: number;
  performanceSummary: string;
  propertyReports: PropertyScoreboard[];
  diagnostics: DiagnosticFinding[];
  services: ServiceRecommendation[];
  contacts: Array<{
    propertyId: string;
    propertyName: string;
    fiduciary: string;
    assetLead: string;
    propertyManager: string;
  }>;
  expenseCategories: MonthlyOperatingReport["expenseCategories"];
};

const factorWeights = {
  noi: 0.24,
  vacancy: 0.18,
  agedReceivables: 0.15,
  agedPayables: 0.14,
  expenseConsistency: 0.15,
  leaseStability: 0.14
} as const;

const assetLeadByManager: Record<string, string> = {
  "mgr-bridge": "Jordan Hale",
  "mgr-millstone": "Leah Morgan",
  "mgr-sterling": "Maya Ford",
  "mgr-crescent": "Reed Lawson"
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function standardDeviation(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function percentChange(current: number, baseline: number) {
  if (!baseline) return 0;
  return ((current - baseline) / baseline) * 100;
}

function annualizeMonthlySeries(values: number[]) {
  return average(values) * 12 * 1000;
}

function toneFromScore(score: number): StatusTone {
  if (score >= 82) return "good";
  if (score >= 70) return "watch";
  return "alert";
}

function bandFromScore(score: number): PropertyScoreboard["healthBand"] {
  if (score >= 82) return "Excellent";
  if (score >= 74) return "Stable";
  if (score >= 65) return "Monitor";
  return "Intervention";
}

function toneWeight(tone: StatusTone) {
  if (tone === "good") return 16;
  if (tone === "watch") return 9;
  if (tone === "neutral") return 6;
  return 0;
}

function scoreLabelFromTone(tone: StatusTone) {
  if (tone === "good") return "Strong";
  if (tone === "watch") return "Watch";
  if (tone === "alert") return "Intervention";
  return "Stable";
}

function latestSeriesValue(values: Array<number | undefined>, fallback: number) {
  const filtered = values.filter((value): value is number => typeof value === "number");
  return filtered.length ? filtered[filtered.length - 1] : fallback;
}

function previousSeriesValue(values: Array<number | undefined>, fallback: number) {
  const filtered = values.filter((value): value is number => typeof value === "number");
  return filtered.length > 1 ? filtered[filtered.length - 2] : filtered[0] ?? fallback;
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

function buildExpenseCategories(property: Property, latestExpense: number, priorExpense: number) {
  const budgetPressure = Math.max(0, -property.budgetVsActual) / 100;

  return getExpenseMix(property.type).map((entry, index) => {
    const current = latestExpense * (entry.weight + budgetPressure * (index === 0 ? 0.12 : 0.03));
    const priorMonth = priorExpense * entry.weight;
    const variancePercent = percentChange(current, priorMonth);
    const tone: StatusTone =
      variancePercent > 12 || (index === 0 && property.openIssues > 2)
        ? "alert"
        : variancePercent > 6
          ? "watch"
          : "good";

    const review =
      tone === "alert"
        ? "Review invoice stack for duplicate billing, scope drift, and coding accuracy."
        : tone === "watch"
          ? "Variance should be tied back to the prior period and current accrual support."
          : "Current month remains inside expected operating range.";

    return {
      category: entry.category,
      current,
      priorMonth,
      variancePercent,
      tone,
      review
    };
  });
}

function getPrimaryLender(propertyProviders: Provider[]) {
  return (
    propertyProviders.find((provider) => provider.type === "Lender")?.name ||
    propertyProviders.find((provider) => provider.type === "Debt Broker")?.name ||
    "No direct debt counterparty assigned"
  );
}

function getPrimarySpecialist(propertyProviders: Provider[]) {
  return (
    propertyProviders.find((provider) =>
      ["CAM Specialist", "CPA", "Attorney", "Insurance Advisor"].includes(provider.type)
    )?.name || "Specialist roster under review"
  );
}

function findContactName(contacts: ContactLine[], role: string, fallback: string) {
  return contacts.find((contact) => contact.role === role)?.name ?? fallback;
}

function buildHealthSummary(property: Property, factors: HealthFactor[]) {
  const weakest = [...factors].sort((a, b) => a.score - b.score).slice(0, 2);
  return `${property.name} is most exposed through ${weakest
    .map((factor) => factor.label.toLowerCase())
    .join(" and ")}. ${property.scoreInputs.leaseComplianceNotes} Priority should stay on preserving NOI while tightening execution discipline before those exceptions widen.`;
}

function buildPropertyScoreboard(dataset: PortfolioDataset, property: Property): PropertyScoreboard {
  const manager = dataset.managers.find((item) => item.id === property.managerId) as Manager;
  const propertyProviders = dataset.providers.filter((provider) => provider.assignedPropertyIds.includes(property.id));
  const propertyIssues = dataset.issues.filter((issue) => issue.propertyId === property.id);
  const propertyProjects = dataset.projects.filter((project) => project.propertyId === property.id);

  const noiSeries = property.performance.map((point) => point.noi);
  const revenueSeries = property.performance.map((point) => point.revenue);
  const expenseSeries = property.performance.map((point) => point.expenses);
  const collectedSeries = property.performance.map((point) => point.collected);
  const vacancySeries = property.performance.map((point) => point.vacancyRate);

  const latestNoi = latestSeriesValue(noiSeries, property.noi / 1000) * 1000;
  const previousNoi = previousSeriesValue(noiSeries, property.noi / 1000) * 1000;
  const latestRevenue = latestSeriesValue(revenueSeries, property.grossMonthlyRent / 1000) * 1000;
  const latestExpense = latestSeriesValue(expenseSeries, property.adminCosts / 1000) * 1000;
  const priorExpense = previousSeriesValue(expenseSeries, property.adminCosts / 1000) * 1000;
  const currentVacancy = latestSeriesValue(vacancySeries, Math.max(0, 100 - property.occupancy));
  const averageVacancy = average(
    vacancySeries.filter((value): value is number => typeof value === "number")
  );
  const projectStress = propertyProjects.filter((project) =>
    ["Delayed", "Over budget", "Needs decision"].includes(project.status)
  ).length;
  const storedScoreInputs = property.scoreInputs as Partial<PropertyScoreInputs>;
  const scoreInputs: PropertyScoreInputs = {
    agedReceivablesAmount:
      storedScoreInputs.agedReceivablesAmount ?? property.grossMonthlyRent * (property.delinquencies / 100),
    agedReceivablesDays:
      storedScoreInputs.agedReceivablesDays ??
      clamp(
        Math.round(18 + property.delinquencies * 12 + Math.max(0, currentVacancy - 4) * 3),
        14,
        95
      ),
    agedPayablesAmount:
      storedScoreInputs.agedPayablesAmount ??
      latestExpense * (0.22 + Math.max(0, -property.budgetVsActual) / 100 + projectStress * 0.05),
    agedPayablesDays:
      storedScoreInputs.agedPayablesDays ??
      clamp(
        Math.round(
          16 + Math.max(0, -property.budgetVsActual) * 3 + property.openIssues * 2 + projectStress * 7
        ),
        14,
        90
      ),
    sameStoreRevenueChange:
      storedScoreInputs.sameStoreRevenueChange ??
      percentChange(
        latestSeriesValue(revenueSeries, property.grossMonthlyRent / 1000),
        revenueSeries[0] ?? property.grossMonthlyRent / 1000
      ),
    sameStoreNoiChange:
      storedScoreInputs.sameStoreNoiChange ??
      percentChange(latestNoi, noiSeries[0] ? noiSeries[0] * 1000 : property.noi),
    leaseComplianceStatus:
      storedScoreInputs.leaseComplianceStatus ??
      (property.managerReview.reportingTimeliness === "alert" ||
      property.managerReview.rentGrowthExecution === "alert"
        ? "alert"
        : property.managerReview.reportingTimeliness === "watch" ||
            property.managerReview.rentGrowthExecution === "watch"
          ? "watch"
          : "good"),
    leaseComplianceNotes:
      storedScoreInputs.leaseComplianceNotes ??
      (property.type === "Retail"
        ? "Lease compliance reflects CAM support, reconciliation timing, and recoverable coding quality."
        : "Lease compliance reflects reporting timeliness, lease-file discipline, and renewal execution."),
    managementAgreementStatus:
      storedScoreInputs.managementAgreementStatus ??
      (property.managerReview.feeFairness === "alert" || property.managerReview.expenseDiscipline === "alert"
        ? "alert"
        : property.managerReview.feeFairness === "watch" || property.managerReview.expenseDiscipline === "watch"
          ? "watch"
          : "good"),
    managementAgreementNotes:
      storedScoreInputs.managementAgreementNotes ??
      property.managerReview.feeNotes ??
      "Management agreement performance remains inside the expected range."
  };
  const agedReceivablesAmount = scoreInputs.agedReceivablesAmount;
  const agedReceivablesDays = scoreInputs.agedReceivablesDays;
  const agedPayablesAmount = scoreInputs.agedPayablesAmount;
  const agedPayablesDays = scoreInputs.agedPayablesDays;

  const expenseVolatility =
    standardDeviation(
      expenseSeries.filter((value): value is number => typeof value === "number")
    ) /
    Math.max(
      1,
      average(expenseSeries.filter((value): value is number => typeof value === "number"))
    );

  const leaseDiscipline =
    toneWeight(property.managerReview.reportingTimeliness) +
    toneWeight(property.managerReview.occupancyManagement) +
    toneWeight(property.managerReview.rentGrowthExecution) +
    toneWeight(property.managerReview.issueResolutionSpeed);
  const governanceDiscipline = average([
    toneWeight(scoreInputs.leaseComplianceStatus),
    toneWeight(scoreInputs.managementAgreementStatus)
  ]);

  const noiMargin = property.noi / Math.max(property.grossMonthlyRent, 1);
  const noiScore = clamp(
    Math.round(
      58 +
        noiMargin * 28 +
        scoreInputs.sameStoreNoiChange * 1.6 -
        Math.max(0, -property.budgetVsActual) * 2.4
    ),
    42,
    97
  );
  const vacancyScore = clamp(
    Math.round(96 - currentVacancy * 4.2 - Math.max(0, averageVacancy - 6) * 1.8),
    35,
    96
  );
  const receivablesScore = clamp(
    Math.round(
      98 -
        (agedReceivablesAmount / Math.max(latestRevenue, 1)) * 52 -
        agedReceivablesDays * 0.35 -
        property.delinquencies * 10
    ),
    30,
    96
  );
  const payablesScore = clamp(
    Math.round(
      94 -
        (agedPayablesAmount / Math.max(latestExpense, 1)) * 40 -
        agedPayablesDays * 0.55 -
        projectStress * 5 -
        Math.max(0, -property.budgetVsActual) * 3
    ),
    30,
    95
  );
  const expenseConsistencyScore = clamp(
    Math.round(96 - expenseVolatility * 180 - Math.max(0, -property.budgetVsActual) * 4.5),
    35,
    96
  );
  const leaseStabilityScore = clamp(
    Math.round(
      50 +
        property.leasedPercent * 0.28 +
        leaseDiscipline +
        governanceDiscipline -
        property.renewalCount * 0.45
    ),
    35,
    97
  );

  const factors: HealthFactor[] = [
    {
      key: "noi",
      label: "NOI strength",
      score: noiScore,
      weight: factorWeights.noi,
      tone: toneFromScore(noiScore),
      valueLabel: `${Math.round(property.noi / 1000)}K current NOI`,
      detail: `Current NOI is ${Math.round(property.noi / 1000)}K, with a trailing annualized run-rate of ${Math.round(
        annualizeMonthlySeries(noiSeries.filter((value): value is number => typeof value === "number")) / 1000
      )}K, while same-store NOI is ${scoreInputs.sameStoreNoiChange >= 0 ? "+" : ""}${scoreInputs.sameStoreNoiChange.toFixed(1)}% against the current budget variance backdrop of ${property.budgetVsActual.toFixed(1)}%.`
    },
    {
      key: "vacancy",
      label: "Vacancy control",
      score: vacancyScore,
      weight: factorWeights.vacancy,
      tone: toneFromScore(vacancyScore),
      valueLabel: `${currentVacancy.toFixed(1)}% vacancy`,
      detail: `Current vacancy stands at ${currentVacancy.toFixed(1)}% against an average trailing level of ${averageVacancy.toFixed(1)}%, with leased occupancy at ${property.leasedPercent.toFixed(1)}%.`
    },
    {
      key: "agedReceivables",
      label: "Aged receivables",
      score: receivablesScore,
      weight: factorWeights.agedReceivables,
      tone: toneFromScore(receivablesScore),
      valueLabel: `${Math.round(agedReceivablesAmount / 1000)}K delinquent`,
      detail: `Recorded receivables exposure is ${Math.round(agedReceivablesAmount / 1000)}K with ${agedReceivablesDays} days of aging pressure based on the property score inputs.`
    },
    {
      key: "agedPayables",
      label: "Aged payables",
      score: payablesScore,
      weight: factorWeights.agedPayables,
      tone: toneFromScore(payablesScore),
      valueLabel: `${Math.round(agedPayablesAmount / 1000)}K payable stack`,
      detail: `Recorded AP exposure is ${Math.round(agedPayablesAmount / 1000)}K with about ${agedPayablesDays} days outstanding after factoring current variance pressure and capex exceptions.`
    },
    {
      key: "expenseConsistency",
      label: "Expense consistency",
      score: expenseConsistencyScore,
      weight: factorWeights.expenseConsistency,
      tone: toneFromScore(expenseConsistencyScore),
      valueLabel: `${(expenseVolatility * 100).toFixed(1)}% volatility`,
      detail: `Expense volatility is ${(expenseVolatility * 100).toFixed(1)}% across the reporting series. Lower volatility and cleaner category behavior support a stronger operating score.`
    },
    {
      key: "leaseStability",
      label: "Lease compliance & stability",
      score: leaseStabilityScore,
      weight: factorWeights.leaseStability,
      tone: toneFromScore(leaseStabilityScore),
      valueLabel: `${property.renewalCount} renewals queued`,
      detail: `${scoreInputs.leaseComplianceNotes} The score also reflects ${property.leasedPercent.toFixed(1)}% leased occupancy, ${property.renewalCount} queued renewals, and management agreement posture.`
    }
  ];

  const healthScore = Math.round(
    factors.reduce((total, factor) => total + factor.score * factor.weight, 0)
  );
  const sameStorePerformance = scoreInputs.sameStoreNoiChange;
  const expenseCategories =
    property.expenseCategories.length > 0
      ? property.expenseCategories
      : buildExpenseCategories(property, latestExpense, priorExpense);
  const quarterlyBase =
    average(
      collectedSeries
        .slice(-3)
        .filter((value): value is number => typeof value === "number")
    ) * 1000;
  const highestVarianceCategory = [...expenseCategories].sort(
    (a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent)
  )[0];

  const diagnostics: PropertyScoreboard["diagnostics"] = {
    findings: [
      {
        title: "General ledger review",
        detail:
          property.budgetVsActual < -3 || expenseCategories.some((category) => category.tone === "alert")
            ? "Expense coding, accrual support, and manager explanations should be challenged before month-end close is accepted."
            : "GL behavior is broadly inside the expected monthly operating band.",
        tone:
          property.budgetVsActual < -3 || expenseCategories.some((category) => category.tone === "alert")
            ? "alert"
            : property.budgetVsActual < 0 || expenseCategories.some((category) => category.tone === "watch")
              ? "watch"
              : "good",
        timeframe: "Current month"
      },
      {
        title: "Duplicate invoice screen",
        detail:
          expenseCategories.some((category) => category.tone === "alert")
            ? `${highestVarianceCategory?.category ?? "High-variance categories"} need invoice-level review to rule out duplicate or miscoded billing.`
            : "No leading duplicate-billing flag surfaced from category variance patterns this cycle.",
        tone: expenseCategories.some((category) => category.tone === "alert") ? "watch" : "good",
        timeframe: "Invoice review"
      },
      {
        title: "Aged payables review",
        detail: `Payable aging is recorded at ${agedPayablesDays} days with ${Math.round(
          agedPayablesAmount / 1000
        )}K of stack requiring owner-side visibility.`,
        tone: agedPayablesDays > 45 ? "alert" : agedPayablesDays > 30 ? "watch" : "good",
        timeframe: "AP diagnostics"
      },
      {
        title: "Lease / CAM audit",
        detail: scoreInputs.leaseComplianceNotes,
        tone: scoreInputs.leaseComplianceStatus,
        timeframe: "Quarterly"
      }
    ],
    priorMonthChange: percentChange(latestNoi, previousNoi),
    quarterlyChange: percentChange(latestNoi, quarterlyBase || latestNoi),
    trailingTwelveChange: sameStorePerformance
  };

  const fiduciary = "Avery Bennett";
  const assetLead = assetLeadByManager[property.managerId] ?? "Portfolio oversight lead";

  const oversight: OversightReview[] = [
    {
      title: "Lease audit review",
      detail: scoreInputs.leaseComplianceNotes,
      owner: assetLead,
      tone: scoreInputs.leaseComplianceStatus
    },
    {
      title: property.type === "Retail" ? "CAM reconciliation" : "Budget vs actual review",
      detail:
        property.type === "Retail"
          ? `${scoreInputs.leaseComplianceNotes} Tie CAM support to reconciliations, recoverable coding, and tenant-by-tenant variance follow-up.`
          : `Challenge current month variance of ${property.budgetVsActual.toFixed(1)}% against the manager package and support stack, with first attention on ${highestVarianceCategory?.category ?? "the top expense categories"}.`,
      owner: manager.name,
      tone:
        property.type === "Retail"
          ? scoreInputs.leaseComplianceStatus
          : property.budgetVsActual < -3
            ? "alert"
            : property.budgetVsActual < 0
              ? "watch"
              : "good"
    },
    {
      title: "Management contract review",
      detail: scoreInputs.managementAgreementNotes,
      owner: fiduciary,
      tone: scoreInputs.managementAgreementStatus
    }
  ];

  const services: ServiceRecommendation[] = [
    {
      title:
        healthScore < 68
          ? "Specialized operational review"
          : "Quarterly performance review",
      detail:
        healthScore < 68
          ? `Deploy an operating review to reconcile leasing, collections, AP discipline, and manager accountability before the next reporting cycle. Primary trigger: ${buildHealthSummary(property, factors)}`
          : "Maintain the standard quarterly review cadence with a focused look at the lowest-scoring factors and monthly operating report exceptions.",
      owner: assetLead,
      urgency: healthScore < 68 ? "Immediate" : "This quarter"
    },
    {
      title:
        property.debtStatus.toLowerCase().includes("maturity") ||
        propertyProjects.some((project) => project.status === "Needs decision")
          ? "Specialized financial review"
          : "Disposition readiness scan",
      detail:
        property.debtStatus.toLowerCase().includes("maturity") ||
        propertyProjects.some((project) => project.status === "Needs decision")
          ? "Refresh refinance, hold/sell, and reserve-support scenarios before the next capital decision."
          : "Keep a light disposition and entity wind-down checklist current so the asset can move quickly if strategy changes.",
      owner: fiduciary,
      urgency:
        property.debtStatus.toLowerCase().includes("maturity") ||
        propertyProjects.some((project) => project.status === "Needs decision")
          ? "This quarter"
          : "Monitor"
    },
    {
      title: "Management agreement / stakeholder intervention",
      detail: `${scoreInputs.managementAgreementNotes} Clarify ownership of fee, lease, and reporting exceptions across ${manager.name} and the assigned specialist stack.`,
      owner: manager.name,
      urgency: scoreInputs.managementAgreementStatus === "alert" ? "Immediate" : "Monitor"
    }
  ];

  const contacts: ContactLine[] =
    property.oversightContacts.length > 0
      ? property.oversightContacts
      : [
          {
            role: "Real estate fiduciary",
            name: fiduciary,
            detail: "Trust Officer · final owner approvals and exception escalation."
          },
          {
            role: "Asset oversight lead",
            name: assetLead,
            detail: `Monthly operating review owner for ${property.market}.`
          },
          {
            role: "Property manager",
            name: manager.name,
            detail: `${manager.status} manager rating · ${manager.propertyIds.length} managed assets.`
          },
          {
            role: "Debt / capital contact",
            name: getPrimaryLender(propertyProviders),
            detail: "Debt maturity, lender communication, and capital decision support."
          },
          {
            role: "Primary specialist",
            name: getPrimarySpecialist(propertyProviders),
            detail: "Specialized lease, tax, legal, insurance, or reconciliation support."
          }
        ];

  return {
    propertyId: property.id,
    propertySlug: property.slug,
    propertyName: property.name,
    market: property.market,
    healthScore,
    healthBand: bandFromScore(healthScore),
    healthTone: toneFromScore(healthScore),
    healthSummary: buildHealthSummary(property, factors),
    sameStorePerformance,
    trailingTwelveNoi: annualizeMonthlySeries(
      noiSeries.filter((value): value is number => typeof value === "number")
    ),
    managementAgreementLabel: `${manager.name} · ${scoreLabelFromTone(scoreInputs.managementAgreementStatus)} agreement`,
    factors,
    monthlyOperatingReport: {
      currentNoi: property.noi,
      annualizedNoi: annualizeMonthlySeries(
        noiSeries.filter((value): value is number => typeof value === "number")
      ),
      vacancyRate: currentVacancy,
      averageVacancyRate: averageVacancy,
      agedReceivablesAmount,
      agedReceivablesDays,
      agedPayablesAmount,
      agedPayablesDays,
      ledgerSummary: [
        {
          label: "Operating revenue",
          value: latestRevenue,
          detail: "Latest reporting month gross operating revenue."
        },
        {
          label: "Operating expenses",
          value: latestExpense,
          detail: "Latest reporting month controllable and non-controllable expenses."
        },
        {
          label: "Net operating income",
          value: latestNoi,
          detail: "Latest reporting month NOI."
        },
        {
          label: "Collections gap",
          value: Math.max(0, ((property.performance.at(-1)?.budget ?? 0) - (property.performance.at(-1)?.collected ?? 0)) * 1000),
          detail: "Budgeted rent not yet collected in the current reporting cycle."
        }
      ],
      expenseCategories
    },
    diagnostics,
    oversight,
    services,
    contacts
  };
}

export function getPropertyScoreboard(dataset: PortfolioDataset, propertyId: string) {
  const property = dataset.properties.find((item) => item.id === propertyId);

  if (!property) {
    throw new Error(`Property ${propertyId} was not found in the portfolio dataset.`);
  }

  return buildPropertyScoreboard(dataset, property);
}

export function getPortfolioScoreboard(dataset: PortfolioDataset): PortfolioScoreboard {
  const propertyReports = dataset.properties.map((property) =>
    buildPropertyScoreboard(dataset, property)
  );
  const averageHealth = Math.round(
    average(propertyReports.map((report) => report.healthScore))
  );
  const annualizedNoi = sum(propertyReports.map((report) => report.trailingTwelveNoi));
  const corporateOverheadProxy =
    sum(dataset.properties.map((property) => property.adminCosts)) * 12 * 0.35;
  const sameStorePerformance = average(
    propertyReports.map((report) => report.sameStorePerformance)
  );
  const expenseCategoryMap = new Map<string, MonthlyOperatingReport["expenseCategories"]>();

  for (const report of propertyReports) {
    for (const category of report.monthlyOperatingReport.expenseCategories) {
      const existing = expenseCategoryMap.get(category.category) ?? [];
      existing.push(category);
      expenseCategoryMap.set(category.category, existing);
    }
  }

  const expenseCategories = [...expenseCategoryMap.entries()]
    .map(([category, entries]) => {
      const tone: StatusTone =
        entries.some((item) => item.tone === "alert")
          ? "alert"
          : entries.some((item) => item.tone === "watch")
            ? "watch"
            : "good";

      return {
        category,
        current: sum(entries.map((item) => item.current)),
        priorMonth: sum(entries.map((item) => item.priorMonth)),
        variancePercent: percentChange(
          sum(entries.map((item) => item.current)),
          sum(entries.map((item) => item.priorMonth))
        ),
        tone,
        review:
          tone === "alert"
            ? "Portfolio-wide invoice review should focus on this category before close."
            : tone === "watch"
              ? "Variance should be tied back to manager notes and accrual support."
              : "Category behavior remains within the current operating band."
      };
    })
    .sort((a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent));
  const managementAgreementAlerts = dataset.properties.filter(
    (property) => property.scoreInputs.managementAgreementStatus === "alert"
  ).length;
  const leaseComplianceAlerts = dataset.properties.filter(
    (property) => property.scoreInputs.leaseComplianceStatus === "alert"
  ).length;

  const portfolioDiagnostics: DiagnosticFinding[] = [
    {
      title: "Portfolio GL diagnostics",
      detail: `${propertyReports.filter((report) => report.healthTone !== "good").length} properties are outside the strong operating band and should be reviewed at close.`,
      tone:
        propertyReports.filter((report) => report.healthTone === "alert").length > 0
          ? "alert"
          : propertyReports.filter((report) => report.healthTone === "watch").length > 0
            ? "watch"
            : "good",
      timeframe: "Current month"
    },
    {
      title: "Duplicate invoice watchlist",
      detail: `${propertyReports.filter((report) =>
        report.diagnostics.findings.some((finding) => finding.title === "Duplicate invoice screen" && finding.tone !== "good")
      ).length} assets need invoice-level duplicate-billing screening in high-variance categories.`,
      tone:
        propertyReports.some((report) =>
          report.diagnostics.findings.some((finding) => finding.title === "Duplicate invoice screen" && finding.tone === "watch")
        )
          ? "watch"
          : "good",
      timeframe: "Invoice review"
    },
    {
      title: "Receivables and payables exposure",
      detail: `Modeled aged receivables total ${Math.round(
        sum(propertyReports.map((report) => report.monthlyOperatingReport.agedReceivablesAmount)) / 1000
      )}K and modeled aged payables total ${Math.round(
        sum(propertyReports.map((report) => report.monthlyOperatingReport.agedPayablesAmount)) / 1000
      )}K.`,
      tone:
        sum(propertyReports.map((report) => report.monthlyOperatingReport.agedPayablesDays > 45 ? 1 : 0)) > 0
          ? "alert"
          : "watch",
      timeframe: "Quarterly"
    },
    {
      title: "Management agreement review",
      detail: `${managementAgreementAlerts} properties need management-contract intervention and ${leaseComplianceAlerts} properties are flagged for lease or CAM compliance follow-up.`,
      tone:
        managementAgreementAlerts > 0 || leaseComplianceAlerts > 0
          ? managementAgreementAlerts > 1 || leaseComplianceAlerts > 1
            ? "alert"
            : "watch"
          : "good",
      timeframe: "Oversight"
    }
  ];

  const services = propertyReports
    .flatMap((report) =>
      report.services.map((service) => ({
        ...service,
        detail: `${report.propertyName}: ${service.detail}`
      }))
    )
    .sort((a, b) => {
      const urgencyRank = { Immediate: 0, "This quarter": 1, Monitor: 2 } as const;
      return urgencyRank[a.urgency] - urgencyRank[b.urgency];
    })
    .slice(0, 6);

  return {
    portfolioHealthScore: averageHealth,
    healthBand: bandFromScore(averageHealth),
    managementAgreements: dataset.properties.length,
    propertyCount: dataset.properties.length,
    fundsFromOperations: annualizedNoi - corporateOverheadProxy,
    sameStorePerformance,
    trailingTwelveNoi: annualizedNoi,
    totalReceivablesExposure: sum(
      propertyReports.map((report) => report.monthlyOperatingReport.agedReceivablesAmount)
    ),
    totalPayablesExposure: sum(
      propertyReports.map((report) => report.monthlyOperatingReport.agedPayablesAmount)
    ),
    performanceSummary: `Portfolio health is ${bandFromScore(averageHealth).toLowerCase()}, supported by ${dataset.properties.length} management agreements across ${dataset.properties.length} assets. The most important pressure points are receivables, payables, and lease or management agreement exceptions on the lowest-scoring properties.`,
    propertyReports: [...propertyReports].sort((a, b) => a.healthScore - b.healthScore),
    diagnostics: portfolioDiagnostics,
    services,
    contacts: propertyReports.map((report) => ({
      propertyId: report.propertyId,
      propertyName: report.propertyName,
      fiduciary: findContactName(report.contacts, "Real estate fiduciary", "Avery Bennett"),
      assetLead: findContactName(report.contacts, "Asset oversight lead", "Portfolio oversight lead"),
      propertyManager: findContactName(report.contacts, "Property manager", "Property manager")
    })),
    expenseCategories
  };
}
