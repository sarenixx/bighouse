ALTER TABLE "Property" ADD COLUMN "scoreInputsJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Property" ADD COLUMN "expenseCategoriesJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Property" ADD COLUMN "oversightContactsJson" TEXT NOT NULL DEFAULT '[]';
