export type RiskLevel = "low" | "moderate" | "elevated" | "critical";
export type StatusTone = "good" | "watch" | "alert" | "neutral";
export type PropertyType = "Multifamily" | "Retail" | "Office" | "Industrial";
export type ProviderType =
  | "Property Manager"
  | "CPA"
  | "Lender"
  | "Debt Broker"
  | "Cost Seg Provider"
  | "CAM Specialist"
  | "1031 Accommodator"
  | "Broker"
  | "Attorney"
  | "Insurance Advisor";

export interface TimePoint {
  month: string;
  performance: number;
  occupancy: number;
  collected: number;
  budget: number;
  revenue?: number;
  expenses?: number;
  noi?: number;
  turnDays?: number;
  vacancyRate?: number;
}

export interface Issue {
  id: string;
  propertyId: string;
  title: string;
  detail: string;
  severity: RiskLevel;
  category: "vacancy" | "capex" | "fees" | "reporting" | "debt" | "leasing";
  owner: string;
  dueDate: string;
  status: "Open" | "Watching" | "Escalated";
}

export interface CapexProject {
  id: string;
  propertyId: string;
  name: string;
  status: "On track" | "Needs decision" | "Delayed" | "Over budget";
  budget: number;
  actual: number;
  progress: number;
  timeline: string;
  ownerDecision: string;
}

export interface DocumentRecord {
  id: string;
  propertyId?: string;
  category:
    | "Property Manager Report"
    | "Financial Statement"
    | "Lease"
    | "Lender Doc"
    | "Tax Doc"
    | "Insurance Doc"
    | "Inspection Report"
    | "Trustee Memo";
  title: string;
  updatedAt: string;
  status: "Current" | "Needs review" | "Awaiting upload";
  source: string;
  fileUrl?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface TimelineNote {
  id: string;
  propertyId: string;
  author: string;
  date: string;
  label: string;
  note: string;
}

export interface ManagerScorecard {
  reportingTimeliness: StatusTone;
  occupancyManagement: StatusTone;
  rentGrowthExecution: StatusTone;
  turnTimeEfficiency: StatusTone;
  expenseDiscipline: StatusTone;
  capexExecution: StatusTone;
  communicationQuality: StatusTone;
  issueResolutionSpeed: StatusTone;
  feeFairness: StatusTone;
  annualSiteVisitComplete: boolean;
  reviewerNotes: string;
  feeNotes: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  assignedPropertyIds: string[];
  status: "Active" | "Watchlist" | "Review due";
  lastReviewed: string;
  flaggedConcerns: string;
  feeNotes: string;
  contractRenewalDate: string;
  nextAction: string;
  performanceReviewed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  cadence: "Monthly" | "Quarterly" | "Annual" | "Trustee";
  owner: string;
  dueDate: string;
  status: "Open" | "In progress" | "Complete";
  propertyId?: string;
  providerId?: string;
  decisionNeeded: string;
}

export interface Manager {
  id: string;
  name: string;
  region: string;
  propertyIds: string[];
  status: "Strong" | "Watchlist" | "Review needed";
  score: number;
  lastReviewDate: string;
  feePosition: string;
  issueCount: number;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  market: string;
  type: PropertyType;
  unitCount: number;
  managerId: string;
  ownershipEntity: string;
  occupancy: number;
  leasedPercent: number;
  averageRent: number;
  delinquencies: number;
  turnTime: number;
  adminCosts: number;
  budgetVsActual: number;
  capexProgress: number;
  noi: number;
  grossMonthlyRent: number;
  risk: RiskLevel;
  openIssues: number;
  activeProjectStatus: string;
  lastReviewDate: string;
  nextActions: string[];
  keyRisks: string[];
  summary: string;
  debtStatus: string;
  serviceProviderIds: string[];
  performance: TimePoint[];
  managerReview: ManagerScorecard;
  renewalCount: number;
}

export interface PortfolioDataset {
  properties: Property[];
  managers: Manager[];
  providers: Provider[];
  issues: Issue[];
  tasks: TaskItem[];
  projects: CapexProject[];
  documents: DocumentRecord[];
  notes: TimelineNote[];
}
