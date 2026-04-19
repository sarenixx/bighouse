# Expand the authenticated real-estate dashboard into a portfolio and property scoreboard

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/workspaces/bighouse/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the authenticated `/dashboard` experience will still keep the existing charts, hot sheet, watchlist, manager snapshot, and property drill-downs, but it will become a fuller real-estate performance scoreboard. Users will be able to see portfolio-wide KPI summaries, modeled property health scores with credit-report-style factor breakdowns, monthly operating report modules, financial diagnostics, lease and contract oversight, intervention/service recommendations, and accountability contacts at both the portfolio and property level.

The user-visible proof is straightforward: after signing in and opening `/dashboard`, the page should show the original operational overview plus a clearly structured scoreboard system. Then, after opening any property detail page such as `/properties/harbor-row-residences`, the property should show an individual health score, monthly operating report diagnostics, audit findings, services, and contacts without removing the current property tabs and workflow controls.

## Progress

- [x] (2026-04-19 03:05Z) Re-read the current `/dashboard`, property detail, data types, and mock-data structure to identify what can be derived without a disruptive schema migration.
- [x] (2026-04-19 03:09Z) Chose to implement the scoreboard as a derived analytics layer computed from the existing portfolio dataset instead of extending the live Prisma schema first.
- [x] (2026-04-19 03:18Z) Added `lib/dashboard-scoreboard.ts` to compute portfolio KPI rollups, property health scores, MOR snapshots, diagnostics, services, and contact ownership from the existing dataset.
- [x] (2026-04-19 03:22Z) Expanded `/dashboard` into a tabbed scoreboard structure while preserving the existing charts, hot sheet, watchlist, calendar, manager snapshot, and geographic summary.
- [x] (2026-04-19 03:24Z) Expanded property detail pages with new Health Score, MOR, Diagnostics, Services, and Contacts tabs while preserving the existing overview, financial, operations, projects, manager, vendor, and document tabs.
- [x] (2026-04-19 03:26Z) Ran `npm test` and `npm run build`, confirmed both passed, and updated this ExecPlan with the final assumptions and evidence.
- [x] (2026-04-19 03:31Z) Added persisted property score inputs, expense-category review rows, and oversight contacts to `lib/types.ts`, `prisma/schema.prisma`, `migrations/0003_property_score_inputs.sql`, `lib/mock-data.ts`, `prisma/seed.ts`, and `lib/server/portfolio-service.ts`.
- [x] (2026-04-19 03:34Z) Updated `lib/dashboard-scoreboard.ts` to prefer persisted score inputs over helper-only placeholders and fixed the portfolio expense rollup to aggregate by category name instead of array position.
- [x] (2026-04-19 03:36Z) Polished `/dashboard` and property health views with clearer Metrics / Diagnostics / Services framing, richer score-input callouts, and more detailed property comparison cards while preserving all existing modules.
- [x] (2026-04-19 03:38Z) Ran `npm run db:generate`, `npm test`, and `npm run build`, confirmed all passed, and updated this ExecPlan for the second-pass architecture.
- [x] (2026-04-19 03:49Z) Added an idempotent property-scoreboard backfill script, wired it into the normal Cloudflare release path, and validated it against a copied local SQLite database with migrated columns.

## Surprises & Discoveries

- Observation: The current data model already contains enough signals to compute a credible modeled “health score” without adding database columns immediately.
  Evidence: `Property` already includes `noi`, `occupancy`, `delinquencies`, `budgetVsActual`, `turnTime`, `openIssues`, `renewalCount`, and a month-by-month `performance` series, while `ManagerScorecard` captures lease/expense/communication discipline.

- Observation: Some requested concepts, especially aged payables, duplicate invoice review, and contact ownership, are not stored directly in the current schema and therefore need to be modeled from the existing oversight data for this pass.
  Evidence: `lib/types.ts` and `lib/mock-data.ts` contain no direct payable-aging ledger table, invoice rows, or stakeholder-contact structure.

- Observation: The existing monthly performance series is rich enough to support a convincing dashboard score model, but not enough to claim strict accounting precision for FFO or true trailing-12 ledger audits.
  Evidence: `Property.performance` includes monthly revenue, expenses, NOI, collections, turn days, and vacancy, but there is no net-income, depreciation, invoice, or AP-aging table in the live dataset.

- Observation: After the first pass, the score inputs proved important enough to persist directly on `Property` instead of staying buried inside a derived helper.
  Evidence: The second pass added `scoreInputs`, `expenseCategories`, and `oversightContacts` to the TypeScript model, Prisma schema, seed flow, and dataset mapping path.

- Observation: Portfolio expense aggregation must group by category label, not array position, once the portfolio mixes Retail, Office, Industrial, and Multifamily assets.
  Evidence: Retail properties surface rows such as `CAM / recoverables`, while Multifamily properties surface rows such as `Payroll / site ops`; the old positional merge in `lib/dashboard-scoreboard.ts` would combine unrelated categories.

- Observation: Adding non-null JSON columns with default `'{}'` and `'[]'` is safe for the migration itself, but it leaves existing seeded properties without usable scoreboard content until a backfill runs.
  Evidence: The new migration `migrations/0003_property_score_inputs.sql` adds the columns with empty defaults, while the dashboard now reads `scoreInputs`, `expenseCategories`, and `oversightContacts` directly for the richer health-score view.

## Decision Log

- Decision: Build the scoreboard as a derived analytics layer under `lib/` instead of altering the Prisma schema for this pass.
  Rationale: The user asked to preserve existing components and expand the dashboard structure. A derived layer lets us ship the new system on both `/dashboard` and property detail pages without a full data migration.
  Date/Author: 2026-04-19 / Codex

- Decision: Keep all current overview and property modules visible, and add scoreboard tabs/sections around them rather than replacing them.
  Rationale: The user explicitly asked to preserve existing dashboard components. The safest way to honor that is additive composition.
  Date/Author: 2026-04-19 / Codex

- Decision: Label modeled accounting-style views through descriptions and context rather than pretending the current demo dataset is a full general-ledger system.
  Rationale: The user asked for FFO, AP/AR, duplicate invoice, and trailing diagnostics. The current data can support credible modeled views, but not true accounting-certifiable calculations without a deeper schema and ingestion layer.
  Date/Author: 2026-04-19 / Codex

- Decision: After validating the derived-only scoreboard, promote the most important score inputs into persisted property fields.
  Rationale: The user wants a scalable portfolio and property-level system. Persisting score inputs, expense reviews, and oversight contacts makes the dashboard more explainable, easier to seed, and safer to reuse across routes and future APIs.
  Date/Author: 2026-04-19 / Codex

- Decision: Aggregate portfolio expense review by category name instead of category position.
  Rationale: Mixed property types use different category sets, so positional aggregation produces misleading portfolio financials.
  Date/Author: 2026-04-19 / Codex

- Decision: Add an idempotent backfill script and run it during normal Cloudflare releases after migrations and before deploy.
  Rationale: Existing D1 rows receive empty JSON defaults from the migration. A repeatable backfill keeps releases safe without re-seeding production data, and it can be run multiple times without overwriting already-populated rows.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

The dashboard now has the requested scoreboard structure at both levels of the product and a stronger data backbone behind it. `/dashboard` preserves the existing overview modules but now clearly separates Metrics, Diagnostics, and Services, adds a richer property comparison directory, and keeps the performance, financial, diagnostic, and intervention layers distinct. Property detail pages now open on a dedicated health-score view, include MOR, diagnostics, services, and contact-accountability tabs, and surface the same-store, lease-compliance, and management-agreement inputs that explain the score.

The main tradeoff for this pass is still accounting realism, not product structure. The demo dataset still does not contain true invoice rows, depreciation, or external accounting feeds, so FFO and some audit-style diagnostics remain modeled. The second-pass improvement is that the dashboard’s most important score inputs are now explicit and reusable instead of being recomputed ad hoc inside a single view helper. The final operational improvement is that normal Cloudflare releases now include a repeatable backfill step so migrated D1 rows get the new scoreboard JSON without wiping production data.

## Context and Orientation

The authenticated portfolio dashboard route is `app/dashboard/page.tsx`. It currently loads the tenant dataset with `getCurrentTenantDataset()` plus existing summary/chart helpers from `lib/server/portfolio-service.ts`, then renders `components/portfolio-overview-content.tsx` inside `components/app-shell.tsx`.

The public landing page at `app/page.tsx` is out of scope for this task. The user wants changes only to the authenticated `/dashboard` and the property-level diagnostics surfaces.

Property drill-down pages live in `app/properties/[slug]/page.tsx`. They already provide tabs for overview, financials, operations, projects, manager review, vendors, and documents. This file is the correct place to extend the property-level scoreboard.

The shared app dataset lives in `lib/types.ts`, `lib/mock-data.ts`, and the dataset mapping logic in `lib/server/portfolio-service.ts`. In the finished implementation, `Property` includes three persisted JSON-backed concepts: `scoreInputs` for aged receivables/payables plus same-store and compliance posture, `expenseCategories` for MOR expense review rows, and `oversightContacts` for ownership/accountability cards.

The storage layer for those fields lives in `prisma/schema.prisma`, the migration `migrations/0003_property_score_inputs.sql`, and the seed writer `prisma/seed.ts`. The scoreboard is therefore a hybrid of persisted property-level inputs plus additional derived rollups inside `lib/dashboard-scoreboard.ts`, not just a purely derived helper anymore.

## Plan of Work

First, create a shared helper module under `lib/` that computes scoreboard view models from `PortfolioDataset`. This module should calculate portfolio-level KPIs such as management agreement count, annualized FFO-style summary, same-store trend, trailing performance summary, and an overall portfolio health score. It should also compute per-property health reports with weighted score factors for NOI, vacancy, aged receivables, aged payables, expense consistency, and lease stability, plus the supporting MOR, diagnostics, service recommendations, and contact ownership blocks.

Second, once the UI proves useful, promote the most important score inputs into the stored property model. Add JSON-backed fields to `Property` in `prisma/schema.prisma`, write the migration, extend `lib/types.ts`, update `lib/mock-data.ts`, update `prisma/seed.ts`, and update `lib/server/portfolio-service.ts` so the same richer score inputs are available in mock mode, local SQLite, and remote D1.

Third, update `components/portfolio-overview-content.tsx` so the current dashboard remains intact but sits inside a clearer information architecture. The existing charts, hot sheet, watchlist, calendar, manager snapshot, and geographic summary should continue to appear. Add new scoreboard sections or tabs above and around them so metrics, diagnostics, and services are clearly separated and scalable across multiple properties. Add a top framing row that explicitly communicates which modules are data, which are diagnostic insight, and which are interventions.

Fourth, update `app/dashboard/page.tsx` to compute the new scoreboard data and pass it into the portfolio overview component. Keep the current summary/chart calculations unless the shared helper meaningfully replaces them.

Fifth, expand `app/properties/[slug]/page.tsx` to show the property-level health score and diagnostic system. Add tabs or card groups for health score, monthly operating report, diagnostics, services, and contact/oversight while preserving the existing overview, financial, operations, project, manager, vendor, and document workflows. Use the persisted score inputs directly in the health area so users can see same-store, compliance, and management-agreement posture separate from the weighted score.

Finally, validate with the normal repository quality gates, update this ExecPlan with the implemented result, and document any modeling assumptions where the current data had to stand in for future ledger integrations. If new persisted scoreboard fields are added after the initial deployment, add an idempotent backfill script and wire it into the non-destructive release flow.

## Concrete Steps

From `/workspaces/bighouse`:

1. Add the shared scoreboard helper and any lightweight presentational components with `apply_patch`.
2. Extend `lib/types.ts`, `lib/mock-data.ts`, `prisma/schema.prisma`, `migrations/0003_property_score_inputs.sql`, `prisma/seed.ts`, and `lib/server/portfolio-service.ts` so score inputs are persisted.
3. Update `app/dashboard/page.tsx` and `components/portfolio-overview-content.tsx`.
4. Update `app/properties/[slug]/page.tsx`.
5. Add or update an idempotent backfill script if existing environments need persisted scoreboard data populated after migration.
6. Run validation:

       npm run db:generate
       npm run db:backfill:scoreboard:local
       npm test
       npm run build

## Validation and Acceptance

Acceptance is based on visible behavior.

After signing in and opening `/dashboard`, the page should:

- still show the existing overview content;
- show portfolio KPI cards that include management agreements, FFO-style summary, same-store performance, and a trailing analysis summary;
- show a portfolio health-score module plus a property-level scoreboard table or list that makes it easy to compare assets;
- separate metrics, diagnostics, and service actions into clear sections or tabs.

After opening a property page, the page should:

- show a single property health score with a factor-by-factor breakdown;
- include MOR-style cards for NOI, vacancy, aged receivables, aged payables, and GL/expense views;
- include diagnostics for invoice or expense anomalies, payables, prior-month/quarter/TTM context;
- include lease/contract oversight, services/interventions, and a property accountability contact card;
- preserve the current existing property modules and workflow forms.

Run `npm run db:generate`, validate the backfill on a migrated local database, then run `npm test` and `npm run build` and expect all steps to pass.

## Idempotence and Recovery

This work is additive. Re-running Prisma generation, the tests, and the build is safe. The migration `migrations/0003_property_score_inputs.sql` is additive and only appends JSON-backed text columns to `Property`, so it is low risk to apply once per environment. If a modeling assumption produces awkward UI or unrealistic outputs, the safe recovery path is to adjust `lib/dashboard-scoreboard.ts` or the seeded mock values rather than backing out the entire scoreboard structure.

## Artifacts and Notes

Pre-change evidence:

    $ sed -n '1,220p' app/dashboard/page.tsx
    ...
    <PortfolioOverviewContent
      dataset={dataset}
      ...
    />

    $ sed -n '1,220p' app/properties/[slug]/page.tsx
    ...
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        ...

These snippets confirm that the current product already has dashboard and property drill-down surfaces, but not the full scoreboard information architecture requested here.

Post-change validation evidence:

    $ npm run db:generate
    ✔ Generated Prisma Client ...

    $ DATABASE_URL="file:./.tmp-backfill.db" npm run db:backfill:scoreboard:local
    Property scoreboard backfill complete. Updated 12, skipped 0, missing 0.

    $ npm test
    Test Files  11 passed (11)
    Tests  29 passed (29)

    $ npm run build
    ✓ Compiled successfully
    ✓ Finished TypeScript ...
    ├ ƒ /dashboard
    ├ ƒ /properties/[slug]
    ƒ Proxy (Middleware)

These results confirm that the scoreboard expansion compiled cleanly and preserved the existing authenticated routes.

## Interfaces and Dependencies

The new shared helper module should expose stable functions equivalent to:

    export function getPortfolioScoreboard(dataset: PortfolioDataset): PortfolioScoreboard;
    export function getPropertyScoreboard(dataset: PortfolioDataset, propertyId: string): PropertyScoreboard;

The returned models should contain:

- portfolio KPI data;
- health score values and breakdown factors;
- monthly operating report summaries;
- diagnostics and review findings;
- services/intervention recommendations;
- contact/accountability ownership blocks.

The underlying `Property` shape should also include:

- `scoreInputs` for aged receivables/payables, same-store revenue and NOI changes, lease compliance status/notes, and management-agreement status/notes;
- `expenseCategories` for MOR expense-review rows;
- `oversightContacts` for the property accountability layer.

These view-model interfaces may live in `lib/types.ts` or in the helper module itself, but they must be named clearly and remain reusable by both `/dashboard` and `app/properties/[slug]/page.tsx`.

Revision note: Created this ExecPlan on 2026-04-19 before implementing the authenticated dashboard scoreboard expansion so the design, assumptions, and progress are restartable from this file alone.

Revision note: Updated on 2026-04-19 after implementation to record the derived-analytics approach, the new `/dashboard` plus property-detail scoreboard structure, the modeled-accounting assumptions, and the passing test/build evidence.

Revision note: Updated again on 2026-04-19 after the second pass to record the new persisted property score inputs, the category-safe portfolio aggregation fix, the refined Metrics / Diagnostics / Services framing, and the passing Prisma generate, test, and build evidence.

Revision note: Updated again on 2026-04-19 after the deployment-safety follow-up to record the idempotent scoreboard backfill, the release-hook integration, and the local maintenance-script validation.
