# Build the real estate portfolio oversight dashboard

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/workspaces/bighouse/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the repository will contain a fully navigable frontend mockup for a premium real estate portfolio oversight business. A user will be able to open the app in a browser, move through executive portfolio views, drill into a property command center, review managers and vendors, inspect reporting and documents, and see realistic seeded data that supports an immediate demo without a backend.

The user-visible outcome is a calm, executive-friendly dashboard built with Next.js, React, TypeScript, Tailwind CSS, shadcn-style UI primitives, Recharts visualizations, and local mock data. The most important proof points are the portfolio overview page, the property detail page, and the manager review / hot sheet patterns that reinforce the “trust, but verify” product positioning.

## Progress

- [x] (2026-04-18 00:00Z) Read repository instructions in `AGENTS.md` and `PLANS.md`; confirmed this is a greenfield app build.
- [x] (2026-04-18 00:16Z) Scaffolded the Next.js application structure, package manifest, TypeScript config, Tailwind setup, and base design tokens.
- [x] (2026-04-18 00:19Z) Created coherent local mock data for 12 properties, managers, vendors, tasks, projects, documents, reports, and timeline notes.
- [x] (2026-04-18 00:20Z) Built reusable layout and display primitives including the responsive sidebar shell, stat cards, badges, tabs, chart wrappers, and card system.
- [x] (2026-04-18 00:23Z) Implemented the portfolio overview page with charts, hot sheet, watchlist, upcoming calendar, geographic summary, and manager performance snapshot.
- [x] (2026-04-18 00:23Z) Implemented the property detail command center with overview, financials, leasing/operations, projects, manager review, vendors, and documents tabs.
- [x] (2026-04-18 00:23Z) Implemented the remaining pages: properties, managers/vendors, tasks & reviews, reporting, documents, settings, provider drill-down, and not-found handling.
- [x] (2026-04-18 00:30Z) Validated linting and production build, corrected Next 16 configuration issues, and updated this plan with final evidence.
- [x] (2026-04-18 00:38Z) Added a presentation-ready client entry route, shared demo journey component, and guided walkthrough page for live sales or trustee demos.
- [x] (2026-04-18 00:39Z) Reworked reporting into a report center with preview routes for portfolio, property, manager, and trustee report cards.
- [x] (2026-04-18 00:40Z) Re-validated linting and production build after the presentation polish pass.
- [x] (2026-04-18 00:45Z) Added print-friendly report mode, generated metadata blocks, export/share/print actions, and appendix sections for report previews.
- [x] (2026-04-18 00:46Z) Added global print styling to hide dashboard chrome on report routes and improve pagination for board-style output.
- [x] (2026-04-18 00:47Z) Re-validated linting and production build after the print/PDF polish pass.
- [x] (2026-04-18 00:55Z) Added shared report definitions, server-side PDF generation, and a real download endpoint at `/api/reports/[slug]`.
- [x] (2026-04-18 00:56Z) Wired report preview and reporting-center export actions to actual PDF downloads.
- [x] (2026-04-18 00:57Z) Re-validated linting, production build, and runtime PDF response headers after the export implementation.
- [x] (2026-04-18 01:15Z) Added Prisma-backed database schema, local SQLite configuration, and a seed pipeline that loads the existing mock portfolio into persistent storage.
- [x] (2026-04-18 01:20Z) Added session-based auth scaffolding with seeded demo credentials, login/logout/session routes, and a route-protection proxy.
- [x] (2026-04-18 01:24Z) Rewired key portfolio pages and API routes to tenant-aware server data instead of direct local mock imports.
- [x] (2026-04-18 01:26Z) Re-validated linting, production build, seeded database setup, login flow, authenticated JSON APIs, and protected PDF export.
- [x] (2026-04-18 01:30Z) Added the first write workflows: create/update issue endpoints and task update endpoint with UI controls on the overview and tasks pages.
- [x] (2026-04-18 01:31Z) Runtime-tested authenticated issue creation and task updates against the live app and confirmed the updated data rendered back into the UI.
- [x] (2026-04-18 01:39Z) Added manager-review editing, timeline note creation, and document upload/tagging routes with property-detail and documents-page UI controls.
- [x] (2026-04-18 01:40Z) Runtime-tested manager-review updates, property notes, and file upload against the live app and confirmed the new data rendered back into the UI.

## Surprises & Discoveries

- Observation: The repository currently contains no application files, package manifest, or existing frontend structure, so the implementation must include the full app scaffold rather than extending an existing project.
  Evidence: `find . -maxdepth 3 -type f | sort` returned only `AGENTS.md`, `PLANS.md`, `README.md`, and Git internals.

- Observation: Next.js 16 no longer accepts the older `next lint` workflow in this repository shape, and React Compiler flags preserved manual memoization and synchronous `setState` in effects.
  Evidence: Early validation failed on `next lint`, on `react-hooks/preserve-manual-memoization`, and on `react-hooks/set-state-in-effect`; replacing the lint command with flat-config ESLint and simplifying the affected React code resolved the failures.

- Observation: An initial `npm install` left a partial `node_modules` tree and failed on retry with an `ENOTEMPTY` removal error.
  Evidence: `npm install` reported `ENOTEMPTY: directory not empty, rmdir '/workspaces/bighouse/node_modules/next/dist/docs/01-app/03-api-reference/02-components'`; removing `node_modules` and reinstalling succeeded.

- Observation: The dashboard became a stronger presentation artifact once the demo story was embedded directly into the product instead of being treated as external presenter notes.
  Evidence: Adding `/login`, `/demo`, and `/reporting/[slug]` created a visible end-to-end narrative from branded entry to trustee-ready output without changing the underlying data model.

- Observation: The report previews felt substantially more credible once print behavior was treated as part of the product experience rather than an afterthought.
  Evidence: Adding chrome-hidden print mode, generated metadata, appendix sections, and print actions turned `/reporting/[slug]` into something that resembles a real trustee packet rather than a screen-only card view.

- Observation: The export layer was easiest to stabilize once report content was extracted into shared data rather than duplicated inside the page route.
  Evidence: Moving report definitions into `lib/report-library.ts` allowed both the HTML preview route and `/api/reports/[slug]` PDF route to reuse the same source of truth.

- Observation: The first real backend modeling friction came from task ownership not being limited to specialist vendors; some review tasks point to property managers instead.
  Evidence: Seeding failed with a foreign key violation on `TaskItem.providerId` until the schema was updated to treat that field as a generic related-party reference rather than a strict provider relation.

- Observation: Prisma 7’s SQLite flow in this environment required the new `prisma.config.ts` + adapter setup, and `db push` behaved more reliably after aligning with the current configuration pattern.
  Evidence: The initial schema with `url` inside `schema.prisma` failed validation; switching to `prisma.config.ts`, a SQLite adapter, and a regenerated client allowed `db:generate`, `db:push`, and runtime Prisma access to succeed.

- Observation: The first useful write slice did not require a full admin console; small embedded controls in the existing hot sheet and task list were enough to make the product feel operational.
  Evidence: Adding `IssueCreateForm`, `IssueStatusControl`, and `TaskUpdateForm` on top of existing pages produced real end-to-end issue/task mutations without redesigning the information architecture.

- Observation: Document intake was easiest to ship by storing uploaded files under `public/uploads` and treating the database record as the system of record for categorization and review metadata.
  Evidence: The `/api/documents` route accepts multipart form data, writes the file to `public/uploads`, stores metadata in `DocumentRecord`, and the uploaded file appears back in `/documents` and the property detail document tab via its saved URL.

- Observation: Next.js App Router route naming rules are strict enough that write endpoints for properties needed their own namespace separate from `/api/properties/[slug]`.
  Evidence: The app failed to boot with both `/api/properties/[slug]` and `/api/properties/[id]/...`; moving the mutation routes to `/api/property-records/[id]/...` resolved the conflict cleanly.

## Decision Log

- Decision: Build the app as a Next.js App Router project from scratch inside the current repository instead of using an interactive generator.
  Rationale: The repository is empty, and creating the files directly keeps the implementation deterministic, reviewable, and friendly to the apply-patch editing constraint.
  Date/Author: 2026-04-18 / Codex

- Decision: Use a lightweight local component set that follows shadcn/ui patterns and styling conventions instead of depending on the shadcn CLI.
  Rationale: The requirement is about component quality and design language, not the generator itself. Implementing the reusable primitives directly keeps the mockup self-contained and avoids unnecessary scaffolding noise.
  Date/Author: 2026-04-18 / Codex

- Decision: Disable typed route enforcement and use flat ESLint config for Next 16 compatibility.
  Rationale: Typed route strictness added friction for static navigation strings in a mockup-heavy app, and the Next 16 toolchain worked more predictably with direct ESLint configuration than with legacy `next lint`.
  Date/Author: 2026-04-18 / Codex

- Decision: Defer chart rendering until client mount using `useSyncExternalStore`.
  Rationale: This removes Recharts static-generation sizing warnings while preserving a polished loading state and avoiding React Compiler lint issues around effect-driven mount flags.
  Date/Author: 2026-04-18 / Codex

- Decision: Treat presentation polish as first-class product surface area by adding in-app demo guidance and executive report previews rather than leaving the dashboard unchanged.
  Rationale: For this business, the sale is as much about confidence and communication quality as raw dashboard density. A branded entry route and report-preview flow make the mockup usable in real client-facing conversations.
  Date/Author: 2026-04-18 / Codex

- Decision: Make report previews explicitly print-friendly and hide dashboard chrome during print output.
  Rationale: The most believable next step after an executive dashboard is a packet-quality deliverable. Trustees and family offices expect printable artifacts, so the reporting routes need to stand on their own outside the app shell.
  Date/Author: 2026-04-18 / Codex

- Decision: Use `@react-pdf/renderer` for server-side PDF generation instead of browser-only print capture.
  Rationale: The export flow needed to return real files from a route handler, which is more reliable and extensible with a server-rendered PDF document than with client-side print automation.
  Date/Author: 2026-04-18 / Codex

- Decision: Use Prisma + SQLite with seeded local data as the first persistence layer instead of introducing a hosted database dependency.
  Rationale: The app needed a real backend spine without adding external infrastructure requirements to the repository. SQLite keeps setup local and reproducible while still exercising a real schema, auth flow, and API layer.
  Date/Author: 2026-04-18 / Codex

- Decision: Implement session auth with a database-backed session table and HTTP-only cookie rather than adding a third-party auth provider in this phase.
  Rationale: The immediate goal was to establish protected routes, tenant context, and a credible product architecture. A local session model is sufficient for this scaffold and keeps future provider integration optional.
  Date/Author: 2026-04-18 / Codex

- Decision: Start write workflows with issue management and task updates before documents or scorecard editing.
  Rationale: These two flows are the fastest path from read-only demo to day-to-day usability because they affect the hot sheet, the review calendar, and the core owner-oversight loop.
  Date/Author: 2026-04-18 / Codex

- Decision: Implement document intake with local file persistence first instead of introducing cloud object storage in this phase.
  Rationale: The immediate goal was to make uploads real and demoable without adding infrastructure dependencies. Local file storage is enough to prove the workflow and can later be swapped for S3 or another managed store.
  Date/Author: 2026-04-18 / Codex

## Outcomes & Retrospective

The repository now contains a demo-ready Next.js application that matches the requested positioning: calm, executive-friendly, and clearly focused on owner oversight rather than property management operations. The seeded data is coherent across 12 properties, multiple managers, and multiple specialist providers, enabling cross-page navigation and realistic exception scenarios.

The most important product surfaces were delivered first and are strong: the portfolio overview communicates urgent issues, watchlist items, and consolidated performance, while the property detail route functions as an owner command center with structured manager review and capex oversight. The surrounding sections complete the demo narrative by showing provider oversight, recurring review tasks, reporting, documents, and settings.

Validation succeeded with `npm run lint` and `npm run build`. The main lesson learned was that Next 16 and modern React compiler rules reward simpler code paths, so removing non-essential memoization and using direct ESLint flat config produced a cleaner, more durable setup.

The second pass made the app presentation-ready rather than merely feature-complete. The new client entry route, guided demo route, and report-preview pages let someone frame the product as a premium service portal and end a walkthrough with a trustee-facing artifact instead of a raw dashboard.

The third pass made the reporting layer feel distribution-ready. Report previews now include generated metadata, prepared-for and distribution context, appendix items, working print behavior, and print-specific styling that removes dashboard chrome for cleaner board-style output.

The fourth pass turned export from mock behavior into a working document pipeline. Report previews and the reporting center now download actual PDF files generated server-side from shared report definitions, and the `/api/reports/[slug]` route responds with `application/pdf` and attachment headers suitable for real delivery workflows.

The fifth pass added the first real product spine. Prisma-backed persistence, seeded tenant/user/session records, protected routes, and tenant-aware API/data services now support live portfolio reads instead of direct in-memory mock imports on the core screens. The login flow is functional, the database can be recreated locally, and the authenticated JSON/API and PDF routes now hang off the same backend foundation.

The sixth pass introduced the first operational write workflows. Users can now log new issues from the overview, change issue status directly from the hot sheet, and update task ownership/status/due dates from the tasks page with changes persisted through authenticated API routes and reflected back into the live UI.

The seventh pass filled in two more core owner-rep workflows: editing manager-review commentary and capturing supporting artifacts. Property detail pages now support updating reviewer notes/fee notes, appending internal timeline notes, and uploading tagged documents, while the documents page supports portfolio-wide intake with saved metadata and downloadable file links.

## Context and Orientation

The repository currently contains no frontend code. This means the first responsibility is to create the project foundation that Next.js expects: a `package.json` manifest, an `app/` directory for route files, a `components/` directory for reusable React components, a `lib/` directory for data and utilities, and the Tailwind configuration that controls shared styling tokens.

This application is a “mockup,” but it must behave like a credible product. “Mock data” means realistic local TypeScript objects that represent properties, managers, vendors, tasks, reviews, documents, charts, and notes. “Portfolio oversight” means the app is focused on owner visibility, monitoring, escalations, and performance review; it must not drift into property-management operating workflows such as tenant messaging or maintenance dispatching.

The visual system should feel premium and calm. In this repository, that will manifest as a restrained neutral palette, serif-accented headings, spacious card layouts, subtle status badges, and clean chart framing. The app should use responsive layout rules so the sidebar, page headers, grids, and tables remain usable on smaller screens.

## Plan of Work

First, create the application scaffold in the repository root. Add `package.json`, `tsconfig.json`, `next.config.ts`, Tailwind and PostCSS config, the global stylesheet, and the root `app/layout.tsx`. Establish a small design system with CSS custom properties in `app/globals.css` so all pages share the same spacing, color, border, and typography rules.

Next, add a typed data model in `lib/types.ts` and a realistic seeded dataset in `lib/mock-data.ts`. This dataset should contain 12 properties in multiple markets, several managers and outside specialists, issue records, task records by cadence, capital projects, documents, performance series for charts, and provider review notes. Add small helper functions in `lib/utils.ts` for class composition, formatting, and status mapping.

Then build shared UI primitives in `components/`. This should include the application shell with a left sidebar and top header, stat cards, section headers, chart cards, badges, data tables, tabs, and timeline/list panels. These components should be reusable across all pages so the app remains cohesive and easy to maintain.

With the foundation in place, implement the portfolio overview route in `app/page.tsx` first. It should consume the shared data and render executive summary cards, performance charts, hot sheet, watchlist, upcoming calendar, and a manager snapshot table. After that, implement the most important drill-down route in `app/properties/[slug]/page.tsx`, including a command-center layout with a dense header, KPI cards, and tabbed sections for overview, financials, operations, projects, manager review, vendors, and documents.

Finally, complete the surrounding routes for properties, managers/vendors, tasks & reviews, reporting, documents, and settings. Ensure the left navigation highlights the active section and every page appears complete with realistic content. Finish by running linting and a production build, starting the app locally if needed, and updating this plan with the final evidence.

## Concrete Steps

Run these commands from `/workspaces/bighouse` as the work progresses:

    npm install
    npm run db:generate
    npm run db:push
    npm run db:seed
    npm run dev
    npm run lint
    npm run build

Expected outcome after implementation: Next.js starts successfully, prints a local URL such as `http://localhost:3000`, and the browser shows the portfolio overview page by default.

## Validation and Acceptance

Acceptance is based on observable behavior.

Run `npm run lint` and expect the project to pass without errors. Run `npm run build` and expect a successful production build. Run `npm run dev`, open the local app in a browser, and verify that:

1. The root route shows a polished portfolio overview with populated executive cards, charts, hot sheet items, watchlist items, and a manager snapshot.
2. The sidebar can navigate to every requested page without dead ends.
3. The properties page links into at least one property detail page that shows all major tabs and realistic content.
4. The managers/vendors, tasks & reviews, reporting, documents, and settings pages all appear complete and responsive.
5. The visual design reflects oversight and executive review rather than property-management operations.

## Idempotence and Recovery

This plan is additive. Re-running `npm install`, `npm run lint`, or `npm run build` is safe. If a command fails due to a missing dependency or syntax error, fix the relevant file and run the command again. Because there is no backend or database in v1, there is no migration or destructive state to recover.

## Artifacts and Notes

Initial repository evidence:

    $ find . -maxdepth 3 -type f | sort
    ./AGENTS.md
    ./PLANS.md
    ./README.md

This confirmed that the app must be scaffolded from scratch.

Final validation evidence:

    $ npm run lint
    > eslint .

    $ npm run build
    Route (app)
    ┌ ƒ /
    ├ ƒ /api/auth/login
    ├ ƒ /api/auth/logout
    ├ ƒ /api/portfolio/overview
    ├ ƒ /api/properties
    ├ ƒ /api/properties/[slug]
    ├ ƒ /api/reports/[slug]
    ├ ○ /demo
    ├ ƒ /documents
    ├ ƒ /login
    ├ ƒ /managers
    ├ ƒ /managers/[id]
    ├ ƒ /properties
    ├ ƒ /properties/[slug]
    ├ ○ /reporting
    ├ ƒ /reporting/[slug]
    ├ ○ /settings
    └ ƒ /tasks

    $ npm run db:push && npm run db:seed

    $ curl -i -c /tmp/bh_cookies.txt -H 'Content-Type: application/json' \
      -d '{"email":"trustee@halcyonfamilyoffice.com","password":"bighouse-demo"}' \
      http://localhost:3000/api/auth/login
    HTTP/1.1 200 OK
    set-cookie: bh_session=...

    $ curl -i -b /tmp/bh_cookies.txt http://localhost:3000/api/portfolio/overview
    HTTP/1.1 200 OK
    content-type: application/json

    $ curl -I -b /tmp/bh_cookies.txt http://localhost:3000/api/reports/trustee-report
    HTTP/1.1 200 OK
    content-disposition: attachment; filename="trustee-report.pdf"
    content-type: application/pdf

    $ curl -i -b /tmp/bh_cookies.txt -H 'Content-Type: application/json' \
      -d '{"propertyId":"prop-harbor","title":"Insurance renewal benchmark requested",...}' \
      http://localhost:3000/api/issues
    HTTP/1.1 200 OK

    $ curl -i -b /tmp/bh_cookies.txt -X PATCH -H 'Content-Type: application/json' \
      -d '{"status":"Complete","owner":"Trust officer",...}' \
      http://localhost:3000/api/tasks/task-12
    HTTP/1.1 200 OK

    $ curl -i -b /tmp/bh_cookies.txt -X PATCH -H 'Content-Type: application/json' \
      -d '{"reviewerNotes":"...", "feeNotes":"...", "annualSiteVisitComplete":true}' \
      http://localhost:3000/api/property-records/prop-westover/manager-review
    HTTP/1.1 200 OK

    $ curl -i -b /tmp/bh_cookies.txt -H 'Content-Type: application/json' \
      -d '{"author":"Avery Bennett","label":"Manager Review","note":"..."}' \
      http://localhost:3000/api/property-records/prop-westover/notes
    HTTP/1.1 200 OK

    $ curl -i -b /tmp/bh_cookies.txt -F 'title=Q2 Trustee Memo Upload' \
      -F 'category=Trustee Memo' -F 'status=Needs review' \
      -F 'propertyId=prop-westover' -F 'file=@/tmp/trustee-memo.txt;type=text/plain' \
      http://localhost:3000/api/documents
    HTTP/1.1 200 OK

## Interfaces and Dependencies

The finished repository should depend on:

- `next`, `react`, and `react-dom` for the application shell and routing.
- `typescript` and `@types/*` packages for static typing.
- `tailwindcss`, `postcss`, and `autoprefixer` for utility-first styling.
- `recharts` for portfolio, occupancy, revenue, and variance charts.
- `lucide-react` for lightweight icons.
- `class-variance-authority`, `clsx`, and `tailwind-merge` for reusable component styling patterns.

The following files and interfaces must exist by the end of the work:

- `lib/types.ts` defining the core application types for properties, managers, vendors, tasks, documents, projects, reviews, and timeline items.
- `lib/mock-data.ts` exporting the seeded portfolio dataset and any derived rollups needed by the pages.
- `components/app-shell.tsx` providing the shared sidebar and header layout.
- `app/page.tsx` implementing the portfolio overview route.
- `app/properties/page.tsx` implementing the portfolio property index.
- `app/properties/[slug]/page.tsx` implementing the property detail command center.
- Additional route files for the remaining sections in the navigation.

Revision note: created the initial ExecPlan to support a greenfield build and document the required implementation order.
Revision note: updated the ExecPlan after implementation to record completed milestones, compatibility decisions, validation evidence, and build-system discoveries.
Revision note: updated the ExecPlan after the presentation-polish phase to capture the branded entry flow, in-app demo guidance, and report-preview additions.
Revision note: updated the ExecPlan after the print/PDF polish phase to capture the report-action workflow, print-friendly shell behavior, and trustee-packet presentation improvements.
Revision note: updated the ExecPlan after the real export phase to capture shared report data, server-side PDF generation, and runtime API validation.
Revision note: updated the ExecPlan after the backend-spine phase to capture Prisma/SQLite persistence, session auth, tenant-aware APIs, and live data integration on core screens.
Revision note: updated the ExecPlan after the first write-workflow phase to capture issue/task mutation routes, embedded editing controls, and runtime mutation checks.
Revision note: updated the ExecPlan after the manager-review and document-intake phase to capture new upload/edit routes, file-handling decisions, and runtime verification.
