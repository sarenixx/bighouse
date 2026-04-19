# Legal Footer Upgrade: Privacy + Terms Pages

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan is maintained in accordance with `PLANS.md` at the repository root.

## Purpose / Big Picture

After this change, visitors can open first-class legal pages from the landing-page footer instead of placeholder links. Specifically, `Privacy` should navigate to `/privacy` and `Terms` should navigate to `/terms`, each rendering the exact legal copy provided by the user. A reviewer should be able to open `/`, click the legal links, and verify the expected heading and effective date on each page.

## Progress

- [x] (2026-04-19 20:42Z) Confirmed current footer legal links are placeholder anchors and no privacy/terms routes exist yet.
- [x] (2026-04-19 20:43Z) Created this ExecPlan before implementing code changes.
- [x] (2026-04-19 20:46Z) Implemented footer legal-link data model upgrade and link rendering changes.
- [x] (2026-04-19 20:48Z) Added `/privacy` page with exact user-supplied policy text.
- [x] (2026-04-19 20:49Z) Added `/terms` page with exact user-supplied terms text.
- [x] (2026-04-19 20:49Z) Added legal-page typography helpers for long-form readability.
- [x] (2026-04-19 20:50Z) Ran validation build and confirmed route generation.
- [x] (2026-04-19 20:50Z) Completed retrospective and revision notes.

## Surprises & Discoveries

- Observation: Footer links are currently string-only labels rendered as `href="#"`, so URL routing requires both data-shape and rendering updates.
  Evidence: `components/client-dashboard-landing.tsx` defines `links: ["Privacy", "Terms", "Cookies"]` and maps all links to anchor tags with `href="#"`.

- Observation: Existing in-progress landing-page work is already present in the working tree and should remain untouched while implementing legal links.
  Evidence: `git status -sb` shows pre-existing modified/untracked files unrelated to this task.

## Decision Log

- Decision: Use dedicated routes (`/privacy`, `/terms`) and direct same-tab navigation from footer links.
  Rationale: Matches explicit user requirement for pop-out URL destinations (`amseta.com/privacy`) and equivalent terms behavior.
  Date/Author: 2026-04-19 / Codex

- Decision: Keep `Cookies` unchanged as a placeholder in this pass.
  Rationale: User requested Privacy and Terms implementation; Cookies was explicitly out of scope in the approved plan.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

Privacy and Terms are now first-class public routes (`/privacy`, `/terms`) and the landing footer now routes directly to those pages. Both legal pages render the exact user-provided legal copy with consistent long-form formatting and preserved effective date.

Validation via `npm run build` succeeded and route output includes both new static pages.

## Context and Orientation

The landing page is rendered by `components/client-dashboard-landing.tsx`, including the footer legal column. Global styles live in `app/globals.css`. Legal pages do not currently exist in the `app` router tree. This change will add two static route pages with structured long-form content and update footer link routing.

## Plan of Work

First, update footer data to use explicit `{ label, href }` links so routing behavior is deterministic. Then add `/privacy` and `/terms` route files that render the exact user-provided legal text with semantic headings and lists. Finally, add small global legal-typography classes to keep long-form content readable and visually consistent with the site.

## Concrete Steps

From repository root (`/workspaces/bighouse`):

1. Edit `components/client-dashboard-landing.tsx` to normalize footer links into objects and route Privacy/Terms to `/privacy` and `/terms`.
2. Add `app/privacy/page.tsx` with full policy text and metadata.
3. Add `app/terms/page.tsx` with full terms text and metadata.
4. Add legal-page helper styles in `app/globals.css`.
5. Run:

    npm run build

Expected outcome: build succeeds and includes `/privacy` and `/terms` routes.

## Validation and Acceptance

Acceptance criteria:

1. On `/`, footer link `Privacy` navigates to `/privacy`.
2. On `/`, footer link `Terms` navigates to `/terms`.
3. `/privacy` contains `Amseta Privacy Policy` and `Effective Date: April 19, 2026`.
4. `/terms` contains `Amseta Terms of Use` and `Effective Date: April 19, 2026`.
5. `npm run build` completes successfully.

## Idempotence and Recovery

All steps are additive and safe to repeat. If styling needs rollback, revert only legal-style blocks in `app/globals.css` and leave route content intact.

## Artifacts and Notes

Artifacts to capture:

- Build output summary showing successful route generation.
- Brief diff summary for footer links and new legal pages.

Captured evidence:

- `npm run build` passed and route list includes `○ /privacy` and `○ /terms`.
- Footer legal links now map to object URLs: `Privacy -> /privacy`, `Terms -> /terms`, `Cookies -> #`.

## Interfaces and Dependencies

New public routes:

- `GET /privacy`
- `GET /terms`

No backend/API/schema changes are required.

Revision note (2026-04-19): Initial ExecPlan created for legal footer + legal pages implementation.
Revision note (2026-04-19): Updated living sections after implementation with completed progress, validation evidence, and final outcomes.
