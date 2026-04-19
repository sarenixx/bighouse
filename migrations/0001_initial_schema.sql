-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "lastReviewDate" DATETIME NOT NULL,
    "feePosition" TEXT NOT NULL,
    "issueCount" INTEGER NOT NULL,
    CONSTRAINT "Manager_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastReviewed" DATETIME NOT NULL,
    "flaggedConcerns" TEXT NOT NULL,
    "feeNotes" TEXT NOT NULL,
    "contractRenewalDate" DATETIME NOT NULL,
    "nextAction" TEXT NOT NULL,
    "performanceReviewed" BOOLEAN NOT NULL,
    CONSTRAINT "Provider_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unitCount" INTEGER NOT NULL,
    "managerId" TEXT NOT NULL,
    "ownershipEntity" TEXT NOT NULL,
    "occupancy" REAL NOT NULL,
    "leasedPercent" REAL NOT NULL,
    "averageRent" REAL NOT NULL,
    "delinquencies" REAL NOT NULL,
    "turnTime" INTEGER NOT NULL,
    "adminCosts" REAL NOT NULL,
    "budgetVsActual" REAL NOT NULL,
    "capexProgress" INTEGER NOT NULL,
    "noi" REAL NOT NULL,
    "grossMonthlyRent" REAL NOT NULL,
    "risk" TEXT NOT NULL,
    "openIssues" INTEGER NOT NULL,
    "activeProjectStatus" TEXT NOT NULL,
    "lastReviewDate" DATETIME NOT NULL,
    "nextActionsJson" TEXT NOT NULL,
    "keyRisksJson" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "debtStatus" TEXT NOT NULL,
    "performanceJson" TEXT NOT NULL,
    "managerReviewJson" TEXT NOT NULL,
    "renewalCount" INTEGER NOT NULL,
    CONSTRAINT "Property_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Property_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PropertyProvider" (
    "propertyId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    PRIMARY KEY ("propertyId", "providerId"),
    CONSTRAINT "PropertyProvider_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PropertyProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Issue_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Issue_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "propertyId" TEXT,
    "providerId" TEXT,
    "decisionNeeded" TEXT NOT NULL,
    CONSTRAINT "TaskItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapexProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "actual" REAL NOT NULL,
    "progress" INTEGER NOT NULL,
    "timeline" TEXT NOT NULL,
    "ownerDecision" TEXT NOT NULL,
    CONSTRAINT "CapexProject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CapexProject_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "fileUrl" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    CONSTRAINT "DocumentRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DocumentRecord_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    CONSTRAINT "TimelineNote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineNote_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Property_tenantId_idx" ON "Property"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_tenantId_slug_key" ON "Property"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "Issue_tenantId_idx" ON "Issue"("tenantId");

-- CreateIndex
CREATE INDEX "TaskItem_tenantId_idx" ON "TaskItem"("tenantId");

-- CreateIndex
CREATE INDEX "CapexProject_tenantId_idx" ON "CapexProject"("tenantId");

-- CreateIndex
CREATE INDEX "DocumentRecord_tenantId_idx" ON "DocumentRecord"("tenantId");

-- CreateIndex
CREATE INDEX "TimelineNote_tenantId_idx" ON "TimelineNote"("tenantId");

