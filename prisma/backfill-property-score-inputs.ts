import "dotenv/config";

import { Prisma } from "@prisma/client";

import { dataset } from "../lib/mock-data";
import { createPrismaClient, getD1HttpParams } from "./runtime-client";

const forceLocal = process.env.BACKFILL_TARGET === "local";
const forceBackfill = process.argv.includes("--force") || process.env.BACKFILL_SCOREBOARD_FORCE === "1";
const prisma = createPrismaClient({ forceLocal });

function isEmptyScoreboardValue(value: string, emptyValue: "{}" | "[]") {
  return !value || value === emptyValue;
}

async function main() {
  console.log(
    !forceLocal && getD1HttpParams()
      ? "Backfilling Cloudflare D1 property scoreboard fields via HTTP adapter..."
      : "Backfilling local SQLite property scoreboard fields..."
  );

  let updatedCount = 0;
  let skippedCount = 0;
  const missingProperties: string[] = [];

  for (const property of dataset.properties) {
    const existing = await prisma.property.findUnique({
      where: { id: property.id },
      select: {
        id: true,
        name: true,
        scoreInputsJson: true,
        expenseCategoriesJson: true,
        oversightContactsJson: true
      }
    });

    if (!existing) {
      missingProperties.push(property.name);
      continue;
    }

    const needsBackfill =
      forceBackfill ||
      isEmptyScoreboardValue(existing.scoreInputsJson, "{}") ||
      isEmptyScoreboardValue(existing.expenseCategoriesJson, "[]") ||
      isEmptyScoreboardValue(existing.oversightContactsJson, "[]");

    if (!needsBackfill) {
      skippedCount += 1;
      continue;
    }

    await prisma.property.update({
      where: { id: property.id },
      data: {
        scoreInputsJson: JSON.stringify(property.scoreInputs),
        expenseCategoriesJson: JSON.stringify(property.expenseCategories),
        oversightContactsJson: JSON.stringify(property.oversightContacts)
      }
    });

    updatedCount += 1;
  }

  console.log(
    `Property scoreboard backfill complete. Updated ${updatedCount}, skipped ${skippedCount}, missing ${missingProperties.length}.`
  );

  if (missingProperties.length > 0) {
    console.log(`Missing properties: ${missingProperties.join(", ")}`);
  }
}

main()
  .catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2022") {
      console.error(
        "Property scoreboard columns are missing. Apply the latest Prisma/Cloudflare migrations before running this backfill."
      );
      process.exitCode = 1;
      return;
    }

    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
