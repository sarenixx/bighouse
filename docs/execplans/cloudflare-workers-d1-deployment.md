# Deploy Amseta on Cloudflare Workers with D1

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/workspaces/bighouse/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, Amseta will be structurally ready to run on Cloudflare instead of only on a local Node server with a `dev.db` SQLite file. A user will be able to build the Next.js app for Cloudflare Workers, bind it to a Cloudflare D1 database, preview it with the Cloudflare runtime locally, and then deploy it to a `workers.dev` URL and attach a purchased Cloudflare-managed domain.

The visible outcome is not just “new config files exist.” The app should still render the public landing page at `/`, still allow sign-in, and still serve the authenticated dashboard, but its server-side data access must come from D1 in Cloudflare execution instead of from the local `better-sqlite3` adapter. The final handoff must also include the exact commands that the user can run in their own Cloudflare account to create the database, apply migrations, seed it, deploy the Worker, and attach the custom domain.

## Progress

- [x] (2026-04-18 06:13Z) Read `PLANS.md`, re-inspected the current Prisma and deployment setup, and confirmed the repository has no Cloudflare deployment wiring yet.
- [x] (2026-04-18 06:14Z) Confirmed the current blocker: `lib/server/prisma.ts` and `prisma/seed.ts` use `@prisma/adapter-better-sqlite3` against `file:./dev.db`, which is not the Cloudflare D1 runtime path.
- [x] (2026-04-18 06:15Z) Verified from official Cloudflare and Prisma docs that the supported target is Next.js on Cloudflare Workers via OpenNext plus D1 via `@prisma/adapter-d1`.
- [x] (2026-04-18 06:16Z) Created a throwaway Cloudflare Next.js sample in `/tmp/cf-next-sample` to inspect the generated `package.json`, `wrangler.jsonc`, `open-next.config.ts`, and `next.config.ts`.
- [x] (2026-04-18 07:04Z) Added Cloudflare Workers/OpenNext dependencies, scripts, `wrangler.jsonc`, `open-next.config.ts`, and `next.config.ts` initialization while preserving the existing local `next dev` and `next start` workflows.
- [x] (2026-04-18 07:18Z) Refactored Prisma initialization so local development still uses `dev.db`, while Cloudflare preview/deploy uses the `DB` D1 binding through `@prisma/adapter-d1`.
- [x] (2026-04-18 07:31Z) Added the first D1 SQL migration at `migrations/0001_initial_schema.sql` and updated `prisma/seed.ts` so the same seed dataset can target either local SQLite or a remote D1 database over HTTP.
- [x] (2026-04-18 06:38Z) Validated `npm run db:generate`, `npm run cf-typegen`, `npm run build`, `npx vitest run tests/proxy.test.ts`, and `npx opennextjs-cloudflare build`. The repository is now structurally ready for the remaining authenticated Cloudflare account and domain steps.
- [x] (2026-04-19 02:18Z) Fixed Vitest drift introduced by the async Prisma runtime switch by updating test mocks to stub `getPrisma()` instead of the removed `prisma` export.
- [x] (2026-04-19 02:19Z) Re-validated the current local quality gate with `npm test` and `npm run build`.
- [x] (2026-04-19 02:22Z) Replaced the placeholder `README.md` with a runbook covering local setup, Cloudflare preview, D1 migration and seeding, deployment, and custom-domain verification.
- [x] (2026-04-19 02:40Z) Split first-time Cloudflare bootstrap from normal releases so repeat deploys no longer reseed or wipe remote D1 data.
- [x] (2026-04-19 02:41Z) Removed `migrations/seed-data.sql` from the migration chain and changed the SQL export helper to write non-migration artifacts without session rows.

## Surprises & Discoveries

- Observation: This repository is a plain Next.js application with no `wrangler.jsonc`, no OpenNext adapter package, and no Cloudflare-specific scripts.
  Evidence: `find . -maxdepth 2` returned `package.json`, `next.config.ts`, and `.env*`, but no Wrangler or Cloudflare deployment config files.

- Observation: Prisma’s current setup is tightly coupled to native SQLite on disk.
  Evidence: `lib/server/prisma.ts` imports `PrismaBetterSqlite3` and constructs it with `process.env.DATABASE_URL ?? "file:./dev.db"`. `prisma/seed.ts` repeats the same adapter.

- Observation: Official Cloudflare guidance for full-stack Next.js points to Workers with the OpenNext adapter, not the static Next.js Pages flow.
  Evidence: Cloudflare’s Next.js Workers guide says “You can deploy your Next.js app to Cloudflare Workers using the OpenNext adapter,” while the Pages guide says full-stack SSR Next.js apps should use the Workers guide.

- Observation: Official Prisma guidance for D1 says the schema should remain `provider = "sqlite"`, but runtime access must switch to `@prisma/adapter-d1`, and migrations should use Wrangler plus `prisma migrate diff`.
  Evidence: Prisma’s D1 docs state “When using Prisma ORM with D1, you need to use the `sqlite` database provider and the `@prisma/adapter-d1` driver adapter,” and describe D1 migration flow with `wrangler d1 migrations create`, `prisma migrate diff`, and `wrangler d1 migrations apply`.

- Observation: The current landing-page and auth work already run successfully on a normal Node production server, so the Cloudflare migration should preserve application behavior first and only then introduce Cloudflare-specific runtime code.
  Evidence: `npm run build` has already been passing repeatedly, and the landing page has been verified on port `3000`.

- Observation: Prisma 7 removed the `--to-schema-datamodel` flag from `prisma migrate diff`; the correct replacement is `--to-schema`.
  Evidence: The first migration-generation attempt failed with the Prisma CLI error “`--to-schema-datamodel` was removed. Please use `--[from/to]-schema` instead,” and rerunning with `--to-schema prisma/schema.prisma` succeeded.

- Observation: `@prisma/adapter-d1` can seed a remote D1 database from Node over HTTPS without running inside a Worker, as long as the script has `CLOUDFLARE_D1_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_DATABASE_ID`.
  Evidence: `node_modules/@prisma/adapter-d1/dist/index-node.d.ts` exposes `D1HttpParams` with those exact environment variables, and the repo’s `prisma/seed.ts` now uses that path when they are present.

- Observation: Next.js 16 `proxy.ts` is Node-only, but the OpenNext Cloudflare build path still expects edge-style middleware semantics for this request gate.
  Evidence: The initial Worker build failed with “Node.js middleware is not currently supported,” while Next.js docs state that `proxy.ts` defaults to the Node runtime and cannot be switched. Replacing `proxy.ts` with `middleware.ts` allowed `npx opennextjs-cloudflare build` to complete successfully.

- Observation: The async Prisma runtime switch changed the unit-test seam from a direct `prisma` export to an awaited `getPrisma()` function, which left a few tests mocking the wrong interface.
  Evidence: `npm test` on 2026-04-19 initially failed with Vitest errors saying `No "getPrisma" export is defined on the "@/lib/server/prisma" mock` in `tests/auth-session.test.ts` and `tests/mutation-guards.test.ts`.

- Observation: Treating seed data as a D1 migration is operationally unsafe because `wrangler d1 migrations apply` will replay destructive demo-data replacement as part of normal releases.
  Evidence: `migrations/seed-data.sql` began with full-table `DELETE` statements and included seeded demo users plus session rows, which the first version of `scripts/deploy-cloudflare.sh` applied before every deploy.

## Decision Log

- Decision: Target Cloudflare Workers with the OpenNext adapter instead of Cloudflare Pages static hosting.
  Rationale: The app is a full-stack Next.js SSR application with authenticated routes, APIs, and database access. Cloudflare’s own guidance says this class of app belongs on Workers.
  Date/Author: 2026-04-18 / Codex

- Decision: Keep Prisma as the data access layer instead of replacing it with direct SQL or another ORM.
  Rationale: The repository already uses generated Prisma client types across `lib/server/auth.ts`, `lib/server/portfolio-service.ts`, and seeding code. Replacing Prisma would multiply risk during a deployment migration. Prisma officially supports D1 via `@prisma/adapter-d1`, so the lower-risk move is to swap adapters, not ORMs.
  Date/Author: 2026-04-18 / Codex

- Decision: Preserve two execution modes: local Node development with `dev.db`, and Cloudflare preview/deploy with D1.
  Rationale: The team still needs fast local iteration without requiring Cloudflare credentials for every code edit. The migration should add the Cloudflare path, not destroy the existing local development loop.
  Date/Author: 2026-04-18 / Codex

- Decision: Use a repository-local D1 migration workflow instead of relying on ad hoc dashboard SQL pastes.
  Rationale: The user wants a real deployment path tied to a purchased domain. That requires repeatable schema creation and seeding so the remote app can be recreated safely later.
  Date/Author: 2026-04-18 / Codex

- Decision: Keep a single `prisma/seed.ts` that auto-selects between local SQLite and remote D1, rather than creating separate seed scripts.
  Rationale: The dataset is the same in both cases, and the only thing that changes is the adapter. One script is easier to maintain and less likely to drift before deployment.
  Date/Author: 2026-04-18 / Codex

- Decision: Use `middleware.ts` instead of `proxy.ts` for request gating until OpenNext and Next.js 16 align on Cloudflare-compatible proxy support.
  Rationale: `proxy.ts` is the new Next.js 16 convention, but in this deployment target it blocked the Worker bundle. `middleware.ts` keeps the auth redirect behavior intact and is the practical compatibility choice for Cloudflare today.
  Date/Author: 2026-04-18 / Codex

- Decision: Promote the deployment handoff from ExecPlan-only notes into the repository `README.md`.
  Rationale: The Cloudflare deployment path is now part of the normal operating surface of the repo. Keeping the runbook in `README.md` makes the workspace restartable without requiring the next contributor to open the ExecPlan first.
  Date/Author: 2026-04-19 / Codex

- Decision: Split Cloudflare operations into `bootstrap:cloudflare` for first-time migration plus seeding, and `release:cloudflare` for non-destructive repeat deploys.
  Rationale: A seeded demo environment still needs an easy one-command bootstrap, but regular releases must preserve production-side edits, uploads, sessions, and future user data.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

The repository now contains the Cloudflare Worker config, D1-aware Prisma runtime switching, a generated initial SQL migration, a seed script that can target either local SQLite or remote D1, and a Cloudflare-compatible `middleware.ts` request gate. Validation passed for Prisma generation, Wrangler type generation, the normal Next.js build, the focused middleware regression test, and the OpenNext Cloudflare build. The remaining work is entirely account-specific: creating the real D1 database, inserting its `database_id` into `wrangler.jsonc`, applying migrations, seeding, deploying, and attaching the custom domain.

## Context and Orientation

The application currently runs as a standard Next.js app. `app/page.tsx` renders the public Amseta landing page. `app/dashboard/page.tsx` renders the authenticated dashboard using `components/app-shell.tsx` and server-side data from `lib/server/portfolio-service.ts`. Authentication lives in `lib/server/auth.ts` and uses Prisma-backed sessions plus an `httpOnly` cookie.

Database access is centralized through `lib/server/prisma.ts`. Right now, that file creates one `PrismaClient` instance using `PrismaBetterSqlite3`, which means every server-side query expects a local SQLite file path such as `file:./dev.db`. This is fine on a long-running Node process and not the right storage model for Cloudflare Workers.

Cloudflare D1 is Cloudflare’s serverless SQL database. It uses SQLite semantics, but the database is accessed through a Worker binding named on the Cloudflare side, not through a file path on disk. Prisma supports D1 by keeping the datasource provider as `sqlite` in `prisma/schema.prisma` while changing the runtime adapter from `@prisma/adapter-better-sqlite3` to `@prisma/adapter-d1` whenever the code is running inside a Worker.

OpenNext is the adapter that converts a Next.js app into the Worker entrypoint and asset bundle that Cloudflare expects. The generated Worker entry script lives at `.open-next/worker.js` and static assets live under `.open-next/assets`. A `wrangler.jsonc` file tells Cloudflare which Worker script to run, which asset directory to serve, which compatibility flags to use, and which bindings such as D1 should be available at runtime.

The repo files that matter most for this migration are:

- `package.json` for scripts and dependencies.
- `next.config.ts` for local Cloudflare dev initialization.
- `prisma/schema.prisma` for generator/runtime settings.
- `prisma/seed.ts` for seed data creation.
- `lib/server/prisma.ts` for runtime Prisma client construction.
- `lib/server/rate-limit-store.ts` because it may need environment handling review for Cloudflare.
- `.env.example` for local setup guidance.
- New files that must be added: `wrangler.jsonc`, `open-next.config.ts`, and likely one or more helper files for D1-aware Prisma setup and Cloudflare bindings access.

## Plan of Work

First, add the Cloudflare deployment shell around the existing app. Update `package.json` to include the OpenNext and Wrangler dependencies plus `deploy`, `preview`, and `cf-typegen` scripts modeled after the known-good C3 sample. Add `wrangler.jsonc` and `open-next.config.ts` in the repo root. Extend `next.config.ts` to initialize the OpenNext local-dev bridge so code can access Cloudflare bindings in `next dev` when available.

Second, refactor Prisma client creation into a small runtime switch. The application needs one helper that can answer a simple question: “am I running in normal Node/local mode or in a Cloudflare Worker with a D1 binding?” In local mode, reuse the current `better-sqlite3` adapter and `DATABASE_URL`. In Cloudflare mode, construct `PrismaD1` with the bound D1 database from the Worker environment. This runtime switch must be invisible to the rest of the app so `prisma.user.findUnique()` and all existing query sites continue to work unchanged.

Third, update the Prisma generation and migration flow for Cloudflare. `prisma/schema.prisma` must be checked for the correct Cloudflare-compatible client generation settings. The repo also needs a migrations directory plus commands that create and apply D1 migrations using Wrangler and Prisma’s SQL diff generation. Seeding must support the remote D1 target as well as local SQLite. The simplest safe approach is to make the seed script accept either the existing local adapter path or a D1 binding path, rather than maintaining two divergent seed datasets.

Fourth, validate both worlds. Keep `npm run build` passing for the normal Next.js build. Add and exercise the Cloudflare preview/build path locally as far as possible in this environment. If Cloudflare account authentication is required for the final remote create/apply/deploy steps, leave the repository fully prepared and document the exact commands and expected prompts the user will run once authenticated in their own account.

Finally, document the domain cutover. Because the user bought the domain on Cloudflare, the handoff should explain how to add the custom domain to the deployed Worker, which DNS records Cloudflare should create or verify, and how to point the apex and `www` hostnames at the live Worker safely.

## Concrete Steps

From `/workspaces/bighouse`:

1. Install Cloudflare deployment dependencies:

       npm install @opennextjs/cloudflare @prisma/adapter-d1
       npm install -D wrangler

2. Add the Cloudflare config files:

       wrangler.jsonc
       open-next.config.ts

3. Update `next.config.ts` to enable local binding access during `next dev`.

4. Refactor Prisma setup in `lib/server/prisma.ts` so it can choose between local SQLite and Cloudflare D1 at runtime.

5. Update `prisma/schema.prisma` and `prisma/seed.ts` for the Cloudflare-compatible path.

6. Add migration helpers and update `package.json` scripts for:

       npm run preview
       npm run deploy
       npm run cf-typegen

7. Run normal build validation:

       npm run build

8. Run Cloudflare type generation and preview validation if the local environment supports it:

       npm run cf-typegen
       npm run preview

9. Prepare the remote D1 and deployment commands for the user’s Cloudflare account:

       npx wrangler d1 create amseta-prod
       npx wrangler d1 migrations create amseta-prod initial_schema
       npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > migrations/0001_initial_schema.sql
       npx wrangler d1 migrations apply amseta-prod --remote
       npm run deploy

## Validation and Acceptance

The migration is acceptable only if the following are all true:

- `npm run build` succeeds from `/workspaces/bighouse`.
- The repository contains a valid Cloudflare Worker configuration (`wrangler.jsonc`) pointing at `.open-next/worker.js` and `.open-next/assets`.
- Prisma still works locally against `dev.db` without breaking current app behavior.
- The Cloudflare runtime path uses D1 via `@prisma/adapter-d1` instead of the disk-backed `better-sqlite3` adapter.
- The repository includes a repeatable migration path for D1 using Wrangler and Prisma-generated SQL.
- The handoff explains the exact remaining authenticated Cloudflare steps needed to create the remote D1 database, apply migrations, seed data, deploy the Worker, and attach the purchased domain.

The final user-visible proof should be: after the user runs the Cloudflare account-specific steps, visiting the deployed Worker or bound custom domain shows the Amseta landing page at `/`, and `/login` plus `/dashboard` continue to function against the Cloudflare-hosted database.

## Idempotence and Recovery

Dependency installation is safe to re-run; `npm install` will converge on the same lockfile state. Adding Wrangler and OpenNext config is additive. The risky area is schema migration. To stay safe, never delete the local `dev.db` as part of this migration. For D1, generate SQL migrations into versioned files and apply them with Wrangler so the steps are replayable and inspectable. If a remote migration fails, fix the SQL or config and rerun the specific `wrangler d1 migrations apply` command instead of making manual dashboard edits.

If Cloudflare preview/build integration exposes a runtime-only issue, keep local Node mode working and document the Worker-specific incompatibility in `Surprises & Discoveries` before proceeding. The repository should never be left in a state where neither local Node nor Cloudflare preview works.

## Artifacts and Notes

Cloudflare’s generated Next.js sample currently uses these scripts in `package.json`:

    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload"
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts"

Cloudflare’s generated Worker config shape currently includes:

    {
      "$schema": "node_modules/wrangler/config-schema.json",
      "main": ".open-next/worker.js",
      "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
      "assets": {
        "binding": "ASSETS",
        "directory": ".open-next/assets"
      }
    }

Prisma’s D1 guidance currently requires:

    datasource db {
      provider = "sqlite"
    }

and runtime use of:

    import { PrismaD1 } from "@prisma/adapter-d1";
    const adapter = new PrismaD1(env.DB);
    const prisma = new PrismaClient({ adapter });

## Interfaces and Dependencies

The migration will add or rely on these libraries and interfaces:

- `@opennextjs/cloudflare` to build and deploy the Next.js app as a Cloudflare Worker.
- `wrangler` to preview locally, generate Worker binding types, manage D1, and deploy.
- `@prisma/adapter-d1` to connect Prisma Client to the D1 binding in Workers.
- Existing `@prisma/adapter-better-sqlite3` for local disk-backed development mode.

At the end of this work, `lib/server/prisma.ts` must expose the same `prisma` client interface used by the rest of the app, but its internal construction must support both:

- local mode: `PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" })`
- Cloudflare mode: `PrismaD1(env.DB)`

The deployment config must provide a D1 binding name that the runtime code can depend on consistently. The initial plan is to use `DB`, because that is the binding name used in Prisma’s D1 examples and Cloudflare’s documentation.

Revision note: Created this ExecPlan after confirming that the app currently has no Cloudflare deployment configuration, uses disk-backed SQLite through Prisma, and therefore needs both a Workers/OpenNext layer and a D1 adapter migration before the purchased Cloudflare domain can serve the live application.

Revision note: Updated the plan after fixing unit tests that still mocked the pre-refactor `prisma` export, rerunning `npm test` plus `npm run build`, and moving the deployment handoff into `README.md` so the repository can be operated without reading this plan first.

Revision note: Updated the plan after the first live deployment exposed an operational risk: normal releases were still applying destructive seed data. The plan now records the split between first-time bootstrap and repeat releases, plus the removal of seed SQL from the schema migration chain.
