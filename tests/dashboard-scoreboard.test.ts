import { describe, expect, it } from "vitest";

import { getPropertyScoreboard } from "@/lib/dashboard-scoreboard";
import { dataset } from "@/lib/mock-data";

describe("dashboard scoreboard", () => {
  it("falls back to derived values when persisted scoreboard fields are empty", () => {
    const mutatedDataset = structuredClone(dataset);
    const property = mutatedDataset.properties[0];

    property.scoreInputs = {} as typeof property.scoreInputs;
    property.expenseCategories = [];
    property.oversightContacts = [];

    const scoreboard = getPropertyScoreboard(mutatedDataset, property.id);

    expect(scoreboard.healthScore).toBeGreaterThan(0);
    expect(Number.isFinite(scoreboard.sameStorePerformance)).toBe(true);
    expect(scoreboard.monthlyOperatingReport.expenseCategories.length).toBeGreaterThan(0);
    expect(scoreboard.contacts.length).toBeGreaterThan(0);
    expect(scoreboard.managementAgreementLabel).toContain("agreement");
  });
});
