# Cinematic Landing Page Refresh

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This plan is maintained in accordance with `PLANS.md` at the repository root.

## Purpose / Big Picture

After this change, visitors who open the site homepage at `/` should immediately experience a more cinematic and intentional first impression that still communicates Amseta's core value proposition. The page should keep the existing business copy and login path but improve visual atmosphere, hierarchy, and section transitions so the brand feels premium rather than generic. A reviewer should be able to run the app, open `/`, and see a layered hero, stronger typography, and clear motion rhythm on both desktop and mobile.

## Progress

- [x] (2026-04-19 20:05Z) Reviewed `app/page.tsx`, `components/client-dashboard-landing.tsx`, and `app/globals.css` to map current homepage rendering and styles.
- [x] (2026-04-19 20:06Z) Created this ExecPlan before implementation work began.
- [x] (2026-04-19 20:29Z) Implemented cinematic structure and styling updates in `components/client-dashboard-landing.tsx` while preserving existing prop interface and CTA paths.
- [x] (2026-04-19 20:31Z) Added landing-specific visual primitives, animation helpers, and typography imports in `app/globals.css`.
- [x] (2026-04-19 20:33Z) Ran validation with fallback: full lint attempted first, then targeted lint for changed TypeScript files after memory failure.
- [x] (2026-04-19 20:35Z) Ran `npm run build` and confirmed production compilation succeeds with the updated landing page.
- [x] (2026-04-19 20:36Z) Finalized retrospective with implementation outcomes and evidence.

## Surprises & Discoveries

- Observation: The current homepage already has cinematic elements (full-screen video, frosted layers, motion), so this effort is a refinement and tone shift rather than a net-new page.
  Evidence: `components/client-dashboard-landing.tsx` currently renders a fixed video backdrop, glass panels, and animated elements throughout.

- Observation: Full-project linting exceeded available Node heap in this runtime, so targeted linting was required to complete validation.
  Evidence: `npm run lint` aborted with `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`; `npx eslint components/client-dashboard-landing.tsx app/page.tsx` completed successfully.

- Observation: Project-wide `tsc --noEmit` currently fails because of existing test typing issues unrelated to homepage changes, while `next build` still succeeds for app compilation.
  Evidence: `e2e/auth-flow.spec.ts(7,55): error TS2339` and `tests/auth-routes.test.ts(140,12): error TS18046`; `npm run build` completed successfully and generated all routes.

## Decision Log

- Decision: Keep the existing `ClientDashboardLandingPage` component and evolve it in place rather than introducing a second homepage component.
  Rationale: Only `app/page.tsx` consumes this component today, so in-place evolution keeps imports stable and reduces migration overhead.
  Date/Author: 2026-04-19 / Codex

- Decision: Preserve existing business sections and CTA destinations while changing visual treatment.
  Rationale: User intent is to focus on the cinematic landing experience, not to alter product messaging or routing behavior.
  Date/Author: 2026-04-19 / Codex

- Decision: Keep all landing visual primitives in reusable CSS classes under `app/globals.css` instead of embedding long inline Tailwind arbitrary values.
  Rationale: Centralized classes make the cinematic system easier to adjust quickly (color direction, overlays, buttons, reveal timing) without rewriting section markup.
  Date/Author: 2026-04-19 / Codex

- Decision: Accept targeted file-level linting as validation evidence when full lint is blocked by environment memory limits.
  Rationale: It verifies syntactic and rule compliance for edited TypeScript files while avoiding false blockers from sandbox resource ceilings.
  Date/Author: 2026-04-19 / Codex

## Outcomes & Retrospective

The homepage now uses a distinctly cinematic visual direction: stronger display typography, darker atmospheric layering, deeper surfaces, and a more intentional motion cadence for hero-to-section progression. Existing business copy themes, section flow, and `/login` CTA destinations were preserved, so brand expression changed without altering product intent.

Validation succeeded for changed TypeScript files using `npx eslint components/client-dashboard-landing.tsx app/page.tsx` after full-project lint was blocked by a Node heap limit in this environment. Remaining gap: full-repo lint should be re-run in a higher-memory environment to re-verify unrelated files with the standard command.
Validation succeeded for changed TypeScript files using `npx eslint components/client-dashboard-landing.tsx app/page.tsx`, and production compilation succeeded with `npm run build`. Remaining gap: full-repo lint should be re-run in a higher-memory environment to re-verify unrelated files with the standard command.

## Context and Orientation

Homepage rendering is server-driven in `app/page.tsx`, which currently returns `ClientDashboardLandingPage` in `publicMode` with summary stats. The primary presentation logic lives in `components/client-dashboard-landing.tsx`, a client component using Next.js links, Lucide icons, and Motion animations. Global style primitives are in `app/globals.css`, including base typography, animation keyframes, and helper classes used by the landing page. The redesign will touch these three files only unless a blocker is discovered.

In this plan, "cinematic" means a deliberate visual language with layered depth, strong typographic hierarchy, and temporal pacing (elements entering with staged motion), not just a background video.

## Plan of Work

First, update the landing component structure to improve composition and visual rhythm. The hero will keep a full-screen atmospheric layer but gain stronger title treatment, better contrast control, and a clearer sequence of information from tagline to CTA. Existing sections (stats, services, how-we-work, about, and final CTA/footer) will remain but receive styling updates that align with the new hero language.

Second, extend `app/globals.css` with landing-specific classes and animation helpers instead of altering app-wide dashboard styles. This includes a dedicated cinematic theme wrapper, refined gradient layers, subtle grain overlay, and expressive yet controlled motion that works on smaller screens.

Finally, run linting to verify no type or formatting regressions, then document observed outcomes in this file and in the final user-facing summary.

## Concrete Steps

From repository root (`/workspaces/bighouse`):

1. Edited `components/client-dashboard-landing.tsx` to refresh the visual system and section composition while keeping existing props and CTA links.
2. Edited `app/globals.css` to add landing-specific style primitives and font imports.
3. Ran:

    npm run lint

Observed outcome: command aborted because of Node out-of-memory in this runtime.

4. Ran fallback validation:

    npx eslint components/client-dashboard-landing.tsx app/page.tsx

Observed outcome: command exited successfully with no lint errors.

5. Ran production compilation check:

    npm run build

Observed outcome: build completed successfully and emitted the homepage route as static output.

## Validation and Acceptance

Validation consists of static and visual checks:

1. Run `npm run lint` from `/workspaces/bighouse` and confirm successful completion (or, if memory-constrained, run targeted `eslint` on touched TypeScript files as interim evidence).
2. Run `npm run dev`, open `http://localhost:3000`, and confirm:
   - Hero appears with cinematic depth and clear headline hierarchy.
   - Primary CTA routes still target `/login` when `publicMode` is enabled.
   - Section spacing and typography remain readable on desktop and mobile widths.
   - Existing stats and section copy still render.

Acceptance is achieved when these checks pass and the homepage clearly reflects a stronger cinematic art direction than the pre-change state.

## Idempotence and Recovery

All edits are source-controlled and safe to re-run. Re-running lint or dev commands is non-destructive. If a style experiment causes regressions, revert only the affected hunks in `components/client-dashboard-landing.tsx` and `app/globals.css` rather than touching unrelated files.

## Artifacts and Notes

Artifacts to capture after implementation:

- Lint command result summary:
  - `npm run lint` failed due to Node heap exhaustion in sandbox runtime.
  - `npx eslint components/client-dashboard-landing.tsx app/page.tsx` passed.
- Build command result summary:
  - `npm run build` passed.
- Additional compile note:
  - `npx tsc --noEmit` reports existing test-file type errors in `e2e/auth-flow.spec.ts` and `tests/auth-routes.test.ts`.
- Brief note of key visual changes by file:
  - `components/client-dashboard-landing.tsx`: rebuilt homepage sections around a stronger cinematic composition and reusable surface/button primitives.
  - `app/globals.css`: added cinematic typography imports, overlays, reveal animation classes, and component-like utility classes for landing visuals.

## Interfaces and Dependencies

`ClientDashboardLandingPage` must keep this external interface:

- Props:
  - `stats: { capexProjects: string; totalUnits: string; grossMonthlyRent: string; occupancyTrends: string }`
  - `publicMode?: boolean`

`app/page.tsx` should continue rendering this component without requiring new props.

Dependencies already in use and expected to remain:

- `next/link` for internal navigation.
- `motion/react` for lightweight section motion.
- `lucide-react` for iconography.

Revision note (2026-04-19): Initial ExecPlan created before implementation to satisfy repository requirement that complex front-end changes be planned and tracked as a living document.
Revision note (2026-04-19): Updated all living sections after implementation to reflect completed edits, lint-memory discovery, and fallback validation evidence.
Revision note (2026-04-19): Added production build evidence and documented existing project-wide TypeScript test typing issues discovered during validation.
