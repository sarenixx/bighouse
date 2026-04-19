# Harden authenticated workflows and add automated coverage

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/workspaces/bighouse/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the app will still feel like the same polished oversight dashboard, but the most important authenticated workflows will be safer and easier to trust. A user will be able to log in, create issues, update tasks, edit manager reviews, and upload documents with stronger server-side checks, while contributors will be able to run automated tests that prove those workflows behave correctly.

The user-visible outcome is not a redesigned screen. It is confidence: invalid or cross-tenant writes are rejected cleanly, risky uploads are filtered before they touch disk, and a repeatable test suite exercises the paths that previously depended on manual clicking and ad hoc `curl` checks.

## Progress

- [x] (2026-04-18 00:00Z) Reviewed the existing application state, current ExecPlan, auth helpers, mutation routes, and the absence of automated tests.
- [x] (2026-04-18 03:05Z) Added shared server-side guard and typed error helpers in `lib/server/mutation-guards.ts` and `lib/server/app-route-error.ts`, then routed issue/task/property mutation flows through them.
- [x] (2026-04-18 03:07Z) Added upload hardening in `lib/server/upload-validation.ts` with MIME allowlist, 10 MB size limit, and sanitized storage filenames; updated the document upload form to surface server error text.
- [x] (2026-04-18 03:09Z) Added a `vitest`-based `npm run test` workflow plus focused tests for tenant property access and upload validation.
- [x] (2026-04-18 03:12Z) Ran `npm run test`, `npm run lint`, and `npm run build`; recorded evidence and updated this document with the implementation result.
- [x] (2026-04-18 03:24Z) Removed source-level demo credentials, moved seed credentials to environment configuration, and added account lockout state to the user model.
- [x] (2026-04-18 03:28Z) Replaced per-process throttle logic with a shared rate-limit backend abstraction that uses Redis when `REDIS_URL` is configured and falls back to local memory for development and tests.
- [x] (2026-04-18 03:31Z) Re-validated `npm run db:generate`, `npm run test`, `npm run lint`, and `npm run build` after the account lockout and Redis-backed rate-limit pass.
- [x] (2026-04-19 02:55Z) Added a D1-backed shared rate-limit backend for Cloudflare Workers, plus a schema migration and focused store test so production no longer depends on a separate Redis service to share counters.

## Surprises & Discoveries

- Observation: The route-protection proxy checks only for the presence of a session cookie, while mutation safety in practice depends on downstream server functions reading the database-backed session.
  Evidence: `proxy.ts` redirects based on cookie existence alone, while `lib/server/auth.ts` performs the actual lookup and expiry cleanup.

- Observation: Several write paths trust `propertyId` directly from the client even though the current tenant boundary already exists in the session.
  Evidence: `createIssueForCurrentTenant`, `createTimelineNoteForCurrentTenant`, and `createDocumentForCurrentTenant` accept a property id and write immediately after `requireSession()` without first proving the property belongs to that tenant.

- Observation: The current document upload path writes any non-empty `File` object to `public/uploads` and does not enforce a maximum size or allowed MIME type list.
  Evidence: `lib/server/portfolio-service.ts` currently checks only `input.file && input.file.size > 0` before persisting the file to disk.

- Observation: The existing `updateMany`-based write paths returned success even when zero rows were updated, which would have made missing-record or cross-tenant mutations look like successful saves.
  Evidence: `updateIssueForCurrentTenant` and `updateTaskForCurrentTenant` originally returned the raw `updateMany` result without checking `count`.

- Observation: Node 20’s built-in `File` implementation is sufficient for direct upload-validator tests, so a browser-like DOM test environment was not necessary for this first milestone.
  Evidence: `tests/upload-validation.test.ts` runs under Vitest’s `node` environment and constructs `new File(...)` successfully.

- Observation: The distributed-throttling upgrade did not require Redis to be present in local development as long as the rate-limit backend was written behind a tiny async abstraction.
  Evidence: `lib/server/rate-limit-store.ts` now chooses Redis only when `REDIS_URL` is configured; the same tests continue to pass locally without a Redis service.

- Observation: The `redis` package’s connected-client type is more specific than the pre-connect client type, so helper code is easier to type when it infers the connected type from `createClient().connect()` instead of naming `RedisClientType` directly.
  Evidence: The first build failed with a RESP generic mismatch until the helper switched to `Awaited<ReturnType<ReturnType<typeof createClient>["connect"]>>`.

- Observation: The existing Redis-or-memory abstraction still left the deployed Cloudflare Worker on per-isolate memory unless a separate Redis service was provisioned and reachable from the Worker runtime.
  Evidence: `lib/server/rate-limit-store.ts` previously checked only `REDIS_URL` and otherwise used an in-memory `Map`, while the live Worker config already had a D1 binding available in `wrangler.jsonc`.

## Decision Log

- Decision: Start the hardening effort with the server mutation boundary and upload path rather than with UI refactors.
  Rationale: The current risk is concentrated where trusted server state meets untrusted input. Fixing those seams improves every existing form without changing the product surface area.
  Date/Author: 2026-04-18 / Codex

- Decision: Add automated tests around small server-side helpers instead of beginning with full browser end-to-end coverage.
  Rationale: The repository currently has no test harness. A fast, local unit/integration layer around guard and validation code will land sooner, run reliably in CI, and create a foundation for later browser coverage.
  Date/Author: 2026-04-18 / Codex

- Decision: Keep the initial hardening pass additive by introducing typed route errors and helper-level validation instead of rewriting the auth/session architecture.
  Rationale: The highest-value improvement was to stop unsafe writes and surface clear failures without destabilizing the rest of the demo-ready application.
  Date/Author: 2026-04-18 / Codex

- Decision: Implement Redis-backed throttling as an optional shared backend with a safe in-memory fallback rather than making Redis a hard requirement for local runs.
  Rationale: The goal was to close the multi-instance gap in production without making day-one development, tests, or preview environments dependent on extra infrastructure.
  Date/Author: 2026-04-18 / Codex

- Decision: Prefer D1-backed shared counters in the Cloudflare Worker runtime while preserving Redis support for non-Worker deployments and memory fallback for local development/tests.
  Rationale: The app already depends on D1 in production, so using it for rate limiting removes an extra infrastructure dependency while still preserving the original abstraction shape.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

The first hardening milestone landed successfully. Property-scoped mutations now prove tenant ownership before writing, issue/task updates no longer silently succeed with zero affected rows, and document uploads enforce an explicit allowlist and a 10 MB size limit before touching disk. The route handlers now translate known application failures into clear JSON error responses instead of relying on generic exceptions.

The repository also now has a real automated test entry point. `npm run test` executes focused server-side tests for the new mutation guard and upload validator, which gives the project a repeatable safety net where previously there was only manual validation.

The second hardening pass tightened the auth surface further. Source-level shared demo credentials are gone, seeded demo access is now environment-driven, login failures can lock an account temporarily, and the rate-limit layer now supports Redis-backed shared counters for multi-instance deployments while keeping a local-memory fallback for development.

The latest pass aligns that shared-counter story with the actual Cloudflare production target. The Worker runtime now uses D1-backed rate-limit buckets through the already-bound `DB` database, which means the deployed login and API throttles no longer depend on per-isolate memory or on provisioning a separate Redis service just to share counters.

The main remaining gap is broader end-to-end confidence and deployment enforcement. This milestone still did not add browser automation, HTTPS/origin enforcement, or a route-by-route DTO review, so a future pass should extend coverage outward from helper tests into route-level, browser-level, and deployment-level controls.

## Context and Orientation

This repository is a Next.js App Router application in `/workspaces/bighouse`. The main authenticated read/write logic lives in `lib/server/portfolio-service.ts`. That module loads the current session with `requireSession()` from `lib/server/auth.ts`, reads and writes Prisma records through `lib/server/prisma.ts`, and is called by route handlers under `app/api/`.

In this repository, a “tenant boundary” means one customer account and its related records. The active tenant is determined by the current authenticated session. A write is “safe” only if the server proves that the target record or related property belongs to that same tenant before changing the database or writing a file.

The most important write routes today are `app/api/issues/route.ts`, `app/api/issues/[id]/route.ts`, `app/api/tasks/[id]/route.ts`, `app/api/property-records/[id]/manager-review/route.ts`, `app/api/property-records/[id]/notes/route.ts`, and `app/api/documents/route.ts`. Their UI entry points live in `components/issue-create-form.tsx`, `components/task-update-form.tsx`, `components/manager-review-form.tsx`, `components/property-note-form.tsx`, and `components/document-upload-form.tsx`.

The repo currently has no test files and no `test` script in `package.json`. That means the only proof of correctness is linting, production build success, and manual runtime checks. This ExecPlan adds a real automated layer without replacing those existing checks.

## Plan of Work

First, extract the risky parts of mutation handling into a small helper module under `lib/server/`. That module should expose narrow functions that accept the current tenant id and a target property id or record id, verify ownership through Prisma, and either return the resolved database record or throw a typed application error. The initial helpers should cover property-scoped writes because issues, notes, manager-review updates, and many documents all rely on property identity supplied by the browser.

Next, update the mutation functions in `lib/server/portfolio-service.ts` to call those helpers before writing. `createIssueForCurrentTenant`, `createTimelineNoteForCurrentTenant`, and `createDocumentForCurrentTenant` should fail fast when a property id does not belong to the current tenant. `updateTaskForCurrentTenant` and `updateIssueForCurrentTenant` should stop silently succeeding with zero updated rows and instead surface a clear not-found or forbidden failure that route handlers can translate into a proper HTTP response.

Then, harden document uploads. Add a server-side validator that accepts only a small allowlist of MIME types used by this product, enforces a maximum file size, and returns a sanitized storage name that preserves the extension but strips unsafe characters. This logic should live outside the route handler so it can be tested directly. The route handler in `app/api/documents/route.ts` should continue to accept multipart form data, but it must now return a useful 400 error for invalid uploads instead of attempting to write everything.

After the server-side behavior is stable, add a lightweight automated test harness. Extend `package.json` with a `test` script and add the minimum dependencies needed to run TypeScript tests in this repository. Create tests that exercise the new mutation-guard helper and the upload validator directly. The tests must prove that valid inputs pass, invalid MIME types fail, oversize files fail, and cross-tenant property references are rejected before any write occurs.

Finally, run lint and the new tests, update the `Progress`, `Surprises & Discoveries`, `Decision Log`, `Outcomes & Retrospective`, and `Artifacts and Notes` sections, and record short command transcripts so a future contributor can repeat the work without inference.

## Concrete Steps

Run these commands from `/workspaces/bighouse` as the work progresses:

    npm install
    npm run lint
    npm run test

If the implementation touches Prisma types but not the schema, `npm run db:generate` should not be necessary. If a schema change becomes necessary anyway, run:

    npm run db:generate

Expected outcome after implementation: lint passes, the automated tests pass, Prisma client generation succeeds after schema changes, production build still succeeds, and throttling can use Redis in production when `REDIS_URL` is configured.

Updated outcome after the Cloudflare follow-up: throttling should use D1-backed shared counters automatically when the app is running inside the deployed Worker, while still allowing Redis-backed or in-memory behavior in the other execution modes.

## Validation and Acceptance

Acceptance is based on observable behavior.

Run `npm run test` and expect the server-focused tests to pass. At minimum, the suite must prove these behaviors:

1. A tenant can resolve one of its own properties through the shared guard helper.
2. A tenant cannot resolve another tenant’s property, and the helper raises a typed error that callers can convert into an HTTP error.
3. The upload validator accepts a supported file type within the configured size limit and returns a sanitized storage filename.
4. The upload validator rejects an unsupported file type and rejects a file that exceeds the configured size limit.

Run `npm run db:generate`, `npm run lint`, and `npm run build` and expect the repository to pass without new warnings or errors.

Manual spot-check acceptance should still work after the automated layer lands:

1. Start the app with `npm run dev`.
2. Log in through `/login` using the seeded demo credentials.
3. Create an issue, update a task, and upload a supported document.
4. Confirm the UI still refreshes correctly after each successful mutation.
5. Confirm an invalid upload returns a clear error instead of a silent failure.

## Idempotence and Recovery

This plan is additive. Re-running `npm run test` and `npm run lint` is safe. Upload validation changes do not require deleting existing files under `public/uploads`; they only affect new requests. If a test dependency install fails halfway, rerun `npm install` from the repository root and repeat the validation commands.

If a mutation guard proves too strict during implementation, keep the guard helper and relax the call site deliberately rather than deleting the shared abstraction. The recovery path is to adjust one rule and re-run the test suite until the behavior matches the documented acceptance criteria.

## Artifacts and Notes

Pre-change evidence:

    $ find . -maxdepth 2 -type f \( -name '*test*' -o -name '*spec*' \) | sort
    <no output>

    $ sed -n '1,220p' app/api/documents/route.ts
    ...
    const file =
      fileCandidate instanceof File && fileCandidate.size > 0 ? fileCandidate : undefined;
    ...

    $ sed -n '281,520p' lib/server/portfolio-service.ts
    ...
    if (input.file && input.file.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      ...
      await writeFile(destination, Buffer.from(arrayBuffer));
    }

These snippets show the starting point: no automated tests and permissive upload handling.

Post-change validation evidence:

    $ npm run test
    RUN  v3.2.4 /workspaces/bighouse
    ✓ tests/mutation-guards.test.ts (2 tests)
    ✓ tests/upload-validation.test.ts (3 tests)
    Test Files  2 passed (2)
    Tests  5 passed (5)

    $ npm run lint
    > eslint .

    $ npm run build
    ✓ Compiled successfully in 21.4s
    Finished TypeScript in 9.3s ...
    Route (app)
    ├ ƒ /api/documents
    ├ ƒ /api/issues
    ├ ƒ /api/issues/[id]
    ├ ƒ /api/property-records/[id]/manager-review
    ├ ƒ /api/property-records/[id]/notes
    └ ƒ /api/tasks/[id]

These results show that the new helpers and route changes are covered by automated tests and still compile inside the full Next.js application.

Second-pass validation evidence:

    $ npm run db:generate
    Loaded Prisma config from prisma.config.ts.
    Prisma schema loaded from prisma/schema.prisma.
    ✔ Generated Prisma Client (7.7.0) to ./generated/prisma

    $ npm run test
    ✓ tests/account-lockout.test.ts (3 tests)
    ✓ tests/api-rate-limit.test.ts (2 tests)
    ✓ tests/login-rate-limit.test.ts (3 tests)
    ✓ tests/rate-limit-store.test.ts (1 test)

    $ npm run build
    ✓ Compiled successfully
    Finished TypeScript ...
    ƒ /api/auth/login
    ƒ Proxy (Middleware)

These results show that the account lockout and shared-store throttle work landed cleanly on top of the earlier hardening pass.

Cloudflare-follow-up validation evidence:

    $ npm run db:generate
    ✔ Generated Prisma Client ...

    $ npm run test
    ✓ tests/rate-limit-store.test.ts (1 test)

    $ npm run build
    ✓ Compiled successfully
    ƒ /api/auth/login
    ƒ Proxy (Middleware)

## Interfaces and Dependencies

Create a new helper module under `lib/server/` with stable names that route handlers and services can reuse. The final implementation should expose functions equivalent to:

    export class AppRouteError extends Error {
      status: number;
      code: string;
    }

    export async function requireTenantPropertyAccess(args: {
      tenantId: string;
      propertyId: string;
    }): Promise<{ id: string; slug: string }>;

    export function validateUploadFile(file: File): {
      mimeType: string;
      fileSize: number;
      sanitizedFilename: string;
    };

Update `lib/server/portfolio-service.ts` so the mutation functions call these helpers before database writes. Update the route handlers under `app/api/` to catch `AppRouteError` and return `NextResponse.json({ error: ... }, { status: ... })` instead of leaking generic exceptions.

The automated test layer should depend on a local TypeScript-capable runner such as Vitest. The tests should live in a new top-level `tests/` directory or another clearly named repository-root test directory so they are easy to discover.

For the distributed-throttling follow-up, the repository should provide a shared async rate-limit backend under `lib/server/rate-limit-store.ts` that exposes functions equivalent to:

    export async function consumeRateLimit(args: {
      namespace: string;
      key: string;
      limit: number;
      windowMs: number;
      now?: number;
    }): Promise<{
      ok: boolean;
      count: number;
      limit: number;
      remaining: number;
      retryAfterSeconds: number;
      resetAt: number;
      backend: "memory" | "redis";
    }>;

    export async function clearRateLimit(args: {
      namespace: string;
      key: string;
    }): Promise<void>;

When the app is running inside the Cloudflare Worker and the `DB` binding exists, these helpers should use D1-backed counters. When `REDIS_URL` is configured in a non-Worker environment, they may use Redis-backed counters. Otherwise they should fall back to in-memory counters so the repository remains easy to run locally.

Plan update note: Updated again on 2026-04-19 after the Cloudflare production hardening pass so the document reflects the D1-backed shared rate-limit backend added on top of the earlier Redis-or-memory abstraction.

Plan update note: Created this ExecPlan on 2026-04-18 to define the first post-demo hardening milestone after the initial dashboard build reached feature-complete status.

Plan update note: Updated on 2026-04-18 after implementing the first hardening milestone so the progress, discoveries, outcomes, and validation evidence match the current repository state.

Plan update note: Updated again on 2026-04-18 after the account-lockout and Redis-backed throttling pass so the document reflects the current auth and infrastructure-hardening work.
