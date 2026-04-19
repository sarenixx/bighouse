import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";

import { dataset } from "../lib/mock-data";
import { hashPassword } from "../lib/server/password";

const tenantId = "tenant-halcyon";
const providerIds = new Set(dataset.providers.map((provider) => provider.id));

function getD1HttpParams() {
  const {
    CLOUDFLARE_D1_TOKEN,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
    CLOUDFLARE_SHADOW_DATABASE_ID
  } = process.env;

  if (!CLOUDFLARE_D1_TOKEN || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_DATABASE_ID) {
    return null;
  }

  return {
    CLOUDFLARE_D1_TOKEN,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_DATABASE_ID,
    ...(CLOUDFLARE_SHADOW_DATABASE_ID
      ? { CLOUDFLARE_SHADOW_DATABASE_ID }
      : {})
  };
}

function createPrismaClient() {
  if (process.env.SEED_TARGET === "local") {
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? "file:./dev.db"
      })
    });
  }

  const d1HttpParams = getD1HttpParams();

  if (d1HttpParams) {
    return new PrismaClient({
      adapter: new PrismaD1(d1HttpParams)
    });
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL ?? "file:./dev.db"
    })
  });
}

const prisma = createPrismaClient();

function requireEnv(name: "DEMO_USER_EMAIL" | "DEMO_USER_PASSWORD") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set before seeding.`);
  }

  return value;
}

const demoUserEmail = requireEnv("DEMO_USER_EMAIL");
const demoUserPassword = requireEnv("DEMO_USER_PASSWORD");

async function main() {
  console.log(
    getD1HttpParams()
      ? "Seeding Cloudflare D1 database via HTTP adapter..."
      : "Seeding local SQLite database..."
  );

  await prisma.session.deleteMany();
  await prisma.timelineNote.deleteMany();
  await prisma.documentRecord.deleteMany();
  await prisma.capexProject.deleteMany();
  await prisma.taskItem.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.propertyProvider.deleteMany();
  await prisma.property.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  await prisma.tenant.create({
    data: {
      id: tenantId,
      name: "Halcyon Family Office",
      slug: "halcyon-family-office"
    }
  });

  await prisma.user.create({
    data: {
      id: "user-trustee",
      tenantId,
      email: demoUserEmail,
      name: "Avery Bennett",
      role: "Trust Officer",
      passwordHash: hashPassword(demoUserPassword)
    }
  });

  await prisma.manager.createMany({
    data: dataset.managers.map((manager) => ({
      id: manager.id,
      tenantId,
      name: manager.name,
      region: manager.region,
      status: manager.status,
      score: manager.score,
      lastReviewDate: new Date(manager.lastReviewDate),
      feePosition: manager.feePosition,
      issueCount: manager.issueCount
    }))
  });

  await prisma.provider.createMany({
    data: dataset.providers.map((provider) => ({
      id: provider.id,
      tenantId,
      name: provider.name,
      type: provider.type,
      status: provider.status,
      lastReviewed: new Date(provider.lastReviewed),
      flaggedConcerns: provider.flaggedConcerns,
      feeNotes: provider.feeNotes,
      contractRenewalDate: new Date(provider.contractRenewalDate),
      nextAction: provider.nextAction,
      performanceReviewed: provider.performanceReviewed
    }))
  });

  for (const property of dataset.properties) {
    await prisma.property.create({
      data: {
        id: property.id,
        tenantId,
        slug: property.slug,
        name: property.name,
        city: property.city,
        state: property.state,
        market: property.market,
        type: property.type,
        unitCount: property.unitCount,
        managerId: property.managerId,
        ownershipEntity: property.ownershipEntity,
        occupancy: property.occupancy,
        leasedPercent: property.leasedPercent,
        averageRent: property.averageRent,
        delinquencies: property.delinquencies,
        turnTime: property.turnTime,
        adminCosts: property.adminCosts,
        budgetVsActual: property.budgetVsActual,
        capexProgress: property.capexProgress,
        noi: property.noi,
        grossMonthlyRent: property.grossMonthlyRent,
        risk: property.risk,
        openIssues: property.openIssues,
        activeProjectStatus: property.activeProjectStatus,
        lastReviewDate: new Date(property.lastReviewDate),
        nextActionsJson: JSON.stringify(property.nextActions),
        keyRisksJson: JSON.stringify(property.keyRisks),
        summary: property.summary,
        debtStatus: property.debtStatus,
        performanceJson: JSON.stringify(property.performance),
        managerReviewJson: JSON.stringify(property.managerReview),
        renewalCount: property.renewalCount
      }
    });
  }

  await prisma.propertyProvider.createMany({
    data: dataset.properties.flatMap((property) =>
      property.serviceProviderIds
        .filter((providerId) => providerIds.has(providerId))
        .map((providerId) => ({
          propertyId: property.id,
          providerId
        }))
    )
  });

  await prisma.issue.createMany({
    data: dataset.issues.map((issue) => ({
      id: issue.id,
      tenantId,
      propertyId: issue.propertyId,
      title: issue.title,
      detail: issue.detail,
      severity: issue.severity,
      category: issue.category,
      owner: issue.owner,
      dueDate: new Date(issue.dueDate),
      status: issue.status
    }))
  });

  await prisma.taskItem.createMany({
    data: dataset.tasks.map((task) => ({
      id: task.id,
      tenantId,
      title: task.title,
      cadence: task.cadence,
      owner: task.owner,
      dueDate: new Date(task.dueDate),
      status: task.status,
      propertyId: task.propertyId,
      providerId: task.providerId,
      decisionNeeded: task.decisionNeeded
    }))
  });

  await prisma.capexProject.createMany({
    data: dataset.projects.map((project) => ({
      id: project.id,
      tenantId,
      propertyId: project.propertyId,
      name: project.name,
      status: project.status,
      budget: project.budget,
      actual: project.actual,
      progress: project.progress,
      timeline: project.timeline,
      ownerDecision: project.ownerDecision
    }))
  });

  await prisma.documentRecord.createMany({
    data: dataset.documents.map((document) => ({
      id: document.id,
      tenantId,
      propertyId: document.propertyId,
      category: document.category,
      title: document.title,
      updatedAt: new Date(document.updatedAt),
      status: document.status,
      source: document.source
    }))
  });

  await prisma.timelineNote.createMany({
    data: dataset.notes.map((note) => ({
      id: note.id,
      tenantId,
      propertyId: note.propertyId,
      author: note.author,
      date: new Date(note.date),
      label: note.label,
      note: note.note
    }))
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
