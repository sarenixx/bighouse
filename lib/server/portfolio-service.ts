import type { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CapexProject,
  DocumentRecord,
  Issue,
  Manager,
  ManagerScorecard,
  PortfolioDataset,
  Property,
  Provider,
  TaskItem,
  TimePoint,
  TimelineNote
} from "@/lib/types";
import { prisma } from "@/lib/server/prisma";
import { requireSession } from "@/lib/server/auth";
import { AppRouteError } from "@/lib/server/app-route-error";
import {
  assertMutationCountUpdated,
  requireTenantPropertyAccess
} from "@/lib/server/mutation-guards";
import { validateUploadFile } from "@/lib/server/upload-validation";

type PropertyRecord = Prisma.PropertyGetPayload<{
  include: {
    providerLinks: { include: { provider: true } };
  };
}>;

type ManagerRecord = Prisma.ManagerGetPayload<{
  include: { properties: true };
}>;

type ProviderRecord = Prisma.ProviderGetPayload<{
  include: { propertyLinks: true };
}>;

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function serializeDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function mapProperty(record: PropertyRecord): Property {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    city: record.city,
    state: record.state,
    market: record.market,
    type: record.type as Property["type"],
    unitCount: record.unitCount,
    managerId: record.managerId,
    ownershipEntity: record.ownershipEntity,
    occupancy: record.occupancy,
    leasedPercent: record.leasedPercent,
    averageRent: record.averageRent,
    delinquencies: record.delinquencies,
    turnTime: record.turnTime,
    adminCosts: record.adminCosts,
    budgetVsActual: record.budgetVsActual,
    capexProgress: record.capexProgress,
    noi: record.noi,
    grossMonthlyRent: record.grossMonthlyRent,
    risk: record.risk as Property["risk"],
    openIssues: record.openIssues,
    activeProjectStatus: record.activeProjectStatus,
    lastReviewDate: serializeDate(record.lastReviewDate),
    nextActions: parseJson<string[]>(record.nextActionsJson),
    keyRisks: parseJson<string[]>(record.keyRisksJson),
    summary: record.summary,
    debtStatus: record.debtStatus,
    serviceProviderIds: record.providerLinks.map((link) => link.providerId),
    performance: parseJson<TimePoint[]>(record.performanceJson),
    managerReview: parseJson<ManagerScorecard>(record.managerReviewJson),
    renewalCount: record.renewalCount
  };
}

function mapManager(record: ManagerRecord): Manager {
  return {
    id: record.id,
    name: record.name,
    region: record.region,
    propertyIds: record.properties.map((property) => property.id),
    status: record.status as Manager["status"],
    score: record.score,
    lastReviewDate: serializeDate(record.lastReviewDate),
    feePosition: record.feePosition,
    issueCount: record.issueCount
  };
}

function mapProvider(record: ProviderRecord): Provider {
  return {
    id: record.id,
    name: record.name,
    type: record.type as Provider["type"],
    assignedPropertyIds: record.propertyLinks.map((link) => link.propertyId),
    status: record.status as Provider["status"],
    lastReviewed: serializeDate(record.lastReviewed),
    flaggedConcerns: record.flaggedConcerns,
    feeNotes: record.feeNotes,
    contractRenewalDate: serializeDate(record.contractRenewalDate),
    nextAction: record.nextAction,
    performanceReviewed: record.performanceReviewed
  };
}

function mapIssue(record: Prisma.IssueGetPayload<object>): Issue {
  return {
    id: record.id,
    propertyId: record.propertyId,
    title: record.title,
    detail: record.detail,
    severity: record.severity as Issue["severity"],
    category: record.category as Issue["category"],
    owner: record.owner,
    dueDate: serializeDate(record.dueDate),
    status: record.status as Issue["status"]
  };
}

function mapTask(record: Prisma.TaskItemGetPayload<object>): TaskItem {
  return {
    id: record.id,
    title: record.title,
    cadence: record.cadence as TaskItem["cadence"],
    owner: record.owner,
    dueDate: serializeDate(record.dueDate),
    status: record.status as TaskItem["status"],
    propertyId: record.propertyId ?? undefined,
    providerId: record.providerId ?? undefined,
    decisionNeeded: record.decisionNeeded
  };
}

function mapDocument(record: Prisma.DocumentRecordGetPayload<object>): DocumentRecord {
  return {
    id: record.id,
    propertyId: record.propertyId ?? undefined,
    category: record.category as DocumentRecord["category"],
    title: record.title,
    updatedAt: serializeDate(record.updatedAt),
    status: record.status as DocumentRecord["status"],
    source: record.source,
    fileUrl: record.fileUrl ?? undefined,
    mimeType: record.mimeType ?? undefined,
    fileSize: record.fileSize ?? undefined,
    originalFilename: record.fileUrl ? path.basename(record.fileUrl) : undefined
  };
}

function mapNote(record: Prisma.TimelineNoteGetPayload<object>): TimelineNote {
  return {
    id: record.id,
    propertyId: record.propertyId,
    author: record.author,
    date: serializeDate(record.date),
    label: record.label,
    note: record.note
  };
}

export async function getTenantDataset(tenantId: string): Promise<PortfolioDataset> {
  const [properties, managers, providers, issues, tasks, projects, documents, notes] = await Promise.all([
    prisma.property.findMany({
      where: { tenantId },
      include: { providerLinks: { include: { provider: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.manager.findMany({
      where: { tenantId },
      include: { properties: true },
      orderBy: { name: "asc" }
    }),
    prisma.provider.findMany({
      where: { tenantId },
      include: { propertyLinks: true },
      orderBy: { name: "asc" }
    }),
    prisma.issue.findMany({ where: { tenantId }, orderBy: { dueDate: "asc" } }),
    prisma.taskItem.findMany({ where: { tenantId }, orderBy: { dueDate: "asc" } }),
    prisma.capexProject.findMany({ where: { tenantId }, orderBy: { name: "asc" } }),
    prisma.documentRecord.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } }),
    prisma.timelineNote.findMany({ where: { tenantId }, orderBy: { date: "desc" } })
  ]);

  return {
    properties: properties.map(mapProperty),
    managers: managers.map(mapManager),
    providers: providers.map(mapProvider),
    issues: issues.map(mapIssue),
    tasks: tasks.map(mapTask),
    projects: projects.map((project): CapexProject => ({
      id: project.id,
      propertyId: project.propertyId,
      name: project.name,
      status: project.status as CapexProject["status"],
      budget: project.budget,
      actual: project.actual,
      progress: project.progress,
      timeline: project.timeline,
      ownerDecision: project.ownerDecision
    })),
    documents: documents.map(mapDocument),
    notes: notes.map(mapNote)
  };
}

export async function getCurrentTenantDataset() {
  const session = await requireSession();
  const dataset = await getTenantDataset(session.tenantId);
  return { session, dataset };
}

export function getPortfolioSummary(dataset: PortfolioDataset) {
  return {
    totalProperties: dataset.properties.length,
    totalUnits: dataset.properties.reduce((sum, property) => sum + property.unitCount, 0),
    occupancyRate:
      dataset.properties.reduce((sum, property) => sum + property.occupancy, 0) /
      dataset.properties.length,
    grossMonthlyRent: dataset.properties.reduce((sum, property) => sum + property.grossMonthlyRent, 0),
    netOperatingIncome: dataset.properties.reduce((sum, property) => sum + property.noi, 0),
    criticalIssues: dataset.issues.filter(
      (issue) => issue.severity === "critical" || issue.status === "Escalated"
    ).length,
    upcomingRenewals: dataset.properties.reduce((sum, property) => sum + property.renewalCount, 0),
    activeCapexProjects: dataset.projects.length
  };
}

export function getPortfolioChart(dataset: PortfolioDataset) {
  return dataset.properties[0]?.performance.map((point, index) => {
    const performance =
      dataset.properties.reduce(
        (sum, property) => sum + property.performance[index].performance,
        0
      ) / dataset.properties.length;
    const occupancy =
      dataset.properties.reduce(
        (sum, property) => sum + property.performance[index].occupancy,
        0
      ) / dataset.properties.length;
    const collected = dataset.properties.reduce(
      (sum, property) => sum + property.performance[index].collected,
      0
    );
    const budget = dataset.properties.reduce(
      (sum, property) => sum + property.performance[index].budget,
      0
    );

    return {
      month: point.month,
      performance: Number(performance.toFixed(1)),
      occupancy: Number(occupancy.toFixed(1)),
      collected,
      budget
    };
  }) ?? [];
}

export function getPropertyContext(dataset: PortfolioDataset, propertyId: string) {
  return {
    issues: dataset.issues.filter((issue) => issue.propertyId === propertyId),
    projects: dataset.projects.filter((project) => project.propertyId === propertyId),
    documents: dataset.documents.filter((document) => document.propertyId === propertyId),
    notes: dataset.notes.filter((note) => note.propertyId === propertyId)
  };
}

export function getPropertyBySlug(dataset: PortfolioDataset, slug: string) {
  return dataset.properties.find((property) => property.slug === slug);
}

export async function createIssueForCurrentTenant(input: {
  propertyId: string;
  title: string;
  detail: string;
  severity: Issue["severity"];
  category: Issue["category"];
  owner: string;
  dueDate: string;
  status: Issue["status"];
}) {
  const session = await requireSession();
  await requireTenantPropertyAccess({
    tenantId: session.tenantId,
    propertyId: input.propertyId
  });

  return prisma.issue.create({
    data: {
      id: `issue-${randomUUID()}`,
      tenantId: session.tenantId,
      propertyId: input.propertyId,
      title: input.title,
      detail: input.detail,
      severity: input.severity,
      category: input.category,
      owner: input.owner,
      dueDate: new Date(input.dueDate),
      status: input.status
    }
  });
}

export async function updateIssueForCurrentTenant(
  issueId: string,
  patch: Partial<Pick<Issue, "status" | "severity" | "owner" | "dueDate" | "detail" | "title">>
) {
  const session = await requireSession();
  const result = await prisma.issue.updateMany({
    where: { id: issueId, tenantId: session.tenantId },
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.severity ? { severity: patch.severity } : {}),
      ...(patch.owner ? { owner: patch.owner } : {}),
      ...(patch.dueDate ? { dueDate: new Date(patch.dueDate) } : {}),
      ...(patch.detail ? { detail: patch.detail } : {}),
      ...(patch.title ? { title: patch.title } : {})
    }
  });

  assertMutationCountUpdated(result.count, "Issue");
  return result;
}

export async function updateTaskForCurrentTenant(
  taskId: string,
  patch: Partial<Pick<TaskItem, "status" | "owner" | "dueDate" | "decisionNeeded">>
) {
  const session = await requireSession();
  const result = await prisma.taskItem.updateMany({
    where: { id: taskId, tenantId: session.tenantId },
    data: {
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.owner ? { owner: patch.owner } : {}),
      ...(patch.dueDate ? { dueDate: new Date(patch.dueDate) } : {}),
      ...(patch.decisionNeeded ? { decisionNeeded: patch.decisionNeeded } : {})
    }
  });

  assertMutationCountUpdated(result.count, "Task");
  return result;
}

export async function updateManagerReviewForCurrentTenant(input: {
  propertyId: string;
  reviewerNotes?: string;
  feeNotes?: string;
  annualSiteVisitComplete?: boolean;
}) {
  const session = await requireSession();
  const property = await requireTenantPropertyAccess({
    tenantId: session.tenantId,
    propertyId: input.propertyId
  });
  const propertyRecord = await prisma.property.findUnique({
    where: { id: property.id }
  });

  if (!propertyRecord) {
    throw new AppRouteError("Property not found for the current account.", {
      status: 404,
      code: "property_not_found"
    });
  }

  const managerReview = parseJson<ManagerScorecard>(propertyRecord.managerReviewJson);
  const nextReview: ManagerScorecard = {
    ...managerReview,
    reviewerNotes: input.reviewerNotes ?? managerReview.reviewerNotes,
    feeNotes: input.feeNotes ?? managerReview.feeNotes,
    annualSiteVisitComplete:
      input.annualSiteVisitComplete ?? managerReview.annualSiteVisitComplete
  };

  await prisma.property.update({
    where: { id: property.id },
    data: {
      managerReviewJson: JSON.stringify(nextReview),
      lastReviewDate: new Date()
    }
  });

  return nextReview;
}

export async function createTimelineNoteForCurrentTenant(input: {
  propertyId: string;
  author: string;
  label: string;
  note: string;
}) {
  const session = await requireSession();
  await requireTenantPropertyAccess({
    tenantId: session.tenantId,
    propertyId: input.propertyId
  });

  return prisma.timelineNote.create({
    data: {
      id: `note-${randomUUID()}`,
      tenantId: session.tenantId,
      propertyId: input.propertyId,
      author: input.author,
      date: new Date(),
      label: input.label,
      note: input.note
    }
  });
}

export async function createDocumentForCurrentTenant(input: {
  propertyId?: string;
  category: DocumentRecord["category"];
  title: string;
  status: DocumentRecord["status"];
  source: string;
  file?: File;
}) {
  const session = await requireSession();
  let fileUrl: string | undefined;
  let mimeType: string | undefined;
  let fileSize: number | undefined;

  if (input.propertyId) {
    await requireTenantPropertyAccess({
      tenantId: session.tenantId,
      propertyId: input.propertyId
    });
  }

  if (input.file && input.file.size > 0) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const upload = validateUploadFile(input.file);
    const storedName = upload.sanitizedFilename;
    const destination = path.join(uploadsDir, storedName);
    const arrayBuffer = await input.file.arrayBuffer();
    await writeFile(destination, Buffer.from(arrayBuffer));
    fileUrl = `/uploads/${storedName}`;
    mimeType = upload.mimeType;
    fileSize = upload.fileSize;
  }

  return prisma.documentRecord.create({
    data: {
      id: `doc-${randomUUID()}`,
      tenantId: session.tenantId,
      propertyId: input.propertyId,
      category: input.category,
      title: input.title,
      updatedAt: new Date(),
      status: input.status,
      source: input.source,
      fileUrl,
      mimeType,
      fileSize
    }
  });
}
