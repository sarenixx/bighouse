# Build the Amseta cinematic landing page inside the client dashboard tab

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows [PLANS.md](/workspaces/bighouse/PLANS.md) from the repository root and must be maintained in accordance with that file.

## Purpose / Big Picture

After this change, the authenticated home screen will include a dedicated `Client Dashboard` tab that opens a cinematic Amseta marketing-style experience instead of forcing that design into the existing owner-oversight dashboard view. A user will be able to sign in, stay on `/`, switch to the new tab, and see the full branded landing page with motion, background videos, animated feature cards, and CTA/footer sections while the original dashboard remains available in a neighboring tab.

## Progress

- [x] (2026-04-18 05:16Z) Read `PLANS.md`, inspected the current `/` page, and confirmed there is no pre-existing client dashboard tab implementation.
- [x] (2026-04-18 05:18Z) Chose to implement the landing page as a new client-side tab inside the current authenticated home route rather than replacing the existing dashboard route.
- [x] (2026-04-18 05:29Z) Installed `motion` and confirmed the `motion/react` import path works in this Next.js app.
- [x] (2026-04-18 05:35Z) Added a tabbed home-shell composition so the existing portfolio overview remains intact beside the new `Client Dashboard` experience.
- [x] (2026-04-18 05:38Z) Implemented the cinematic Amseta landing page component with the requested section structure, floating navbar, dual scroll-scrubbed videos, and Motion-powered icon row.
- [x] (2026-04-18 05:40Z) Merged the requested Inter font, animation utilities, selection styling, and gradient-border button rules into `app/globals.css`.
- [x] (2026-04-18 05:46Z) Completed production validation with `npm run build` plus a Playwright login flow against `next start` on port `3002`, verifying the `Client Dashboard` tab and CTA/footer content.

## Surprises & Discoveries

- Observation: The repository does not already contain a “Client Dashboard” tab or route-level tab switcher on `/`.
  Evidence: `app/page.tsx` currently renders the full portfolio overview directly inside `AppShell`, and the only tab primitive is the generic wrapper in `components/ui/tabs.tsx`.

- Observation: The project currently uses Next.js rather than Vite, and it does not have the Motion package installed.
  Evidence: `package.json` contains `next` and no `motion`/`framer-motion` dependency; `node_modules/motion` and `node_modules/framer-motion` were both missing.

- Observation: The combined CTA/footer wrapper needed a stricter `HTMLDivElement` ref type for TypeScript to accept the `ref` assignment on the `<div>`.
  Evidence: The first production build failed with `Type 'RefObject<HTMLElement | null>' is not assignable to type 'Ref<HTMLDivElement>'` at `components/client-dashboard-landing.tsx`.

## Decision Log

- Decision: Keep the new landing page inside a `Client Dashboard` tab on the authenticated `/` page instead of replacing the existing dashboard route.
  Rationale: The user explicitly asked for all work to live in the client dashboard tab. This preserves the current owner-oversight dashboard and avoids breaking existing navigation.
  Date/Author: 2026-04-18 / Codex

- Decision: Add the requested CSS animations and utilities to `app/globals.css`, but scope the dramatic black cinematic layout to the landing-page tab wrapper rather than globally replacing the entire application shell.
  Rationale: The prompt asked for a specific page-level look, but the user also constrained the work to a single tab. Scoping the layout prevents accidental regressions in the rest of the authenticated app.
  Date/Author: 2026-04-18 / Codex

## Outcomes & Retrospective

The change achieved the intended user-visible result. The authenticated home route now exposes a dedicated `Client Dashboard` tab that opens a cinematic Amseta landing page while the existing operational overview remains available as a sibling tab. The landing page includes the requested dark visual treatment, floating navbar, video-backed sections, feature bento cards, and fused CTA/footer region, all inside the tab the user asked for.

The main compromise was architectural, not visual: because this repository is a Next.js application rather than a Vite single-page app, the requested `App.tsx`/`index.css` structure was adapted into `components/client-dashboard-landing.tsx`, `components/home-dashboard-tabs.tsx`, and `app/globals.css`. That kept the feature aligned with the existing app instead of bolting on a parallel entry point.

## Context and Orientation

The current authenticated home route lives in `app/page.tsx`. It is a server component that loads the current tenant dataset via `getCurrentTenantDataset()` from `lib/server/portfolio-service.ts` and renders the owner-oversight dashboard inside `components/app-shell.tsx`.

`components/app-shell.tsx` provides the left navigation chrome and the top page header. It is already a client component and can host client-only children safely. `components/ui/tabs.tsx` wraps Radix Tabs and already matches the rest of the design system, so it is the right primitive for introducing a `Client Dashboard` tab without inventing a parallel state mechanism.

The new landing page requires browser-only behavior: `useEffect`, video refs, `requestAnimationFrame`, and Motion animations. That means the cinematic page must live in a client component. The existing dashboard content can remain data-driven and be passed from the server page into a new client tab container.

Global styles currently live in `app/globals.css`. That file already sets theme variables, selection color, print rules, and utility backgrounds. The requested `float-up`, `spin-ring`, and gradient-border button styles should be added there so the new tab component can use simple class names.

## Plan of Work

First, refactor the home route so `app/page.tsx` keeps loading the dataset on the server but hands the rendered experience to a new client component, likely something like `components/home-dashboard-tabs.tsx`. That client component will render a tab list with at least two tabs: the existing dashboard content and the new `Client Dashboard` landing page. To keep the refactor manageable, extract the existing overview markup into a dedicated presentational component that receives the dataset-derived props it already uses.

Second, create a new client component for the Amseta landing page. This component will contain the reusable `Logo` SVG, the four refs requested by the prompt, the dual scroll-scrubbing `useEffect` logic, the floating navbar, hero, stats rail, feature section, scroll-tied section, bento grid, and combined CTA/footer video wrapper. The section should be self-contained and use the exact video URL and icon set requested by the prompt.

Third, update `app/globals.css` to add the Inter font import, the `@theme` font variable, universal font application, custom selection color, `float-up` and `spin-ring` keyframes, staggered utility classes, and the pseudo-element gradient border button class. Existing theme variables and print rules should remain intact unless they directly conflict.

Fourth, install the `motion` package so `import { motion } from "motion/react"` works. Then run a full production build and manually verify that `/` still works, the overview tab still renders, and the new `Client Dashboard` tab shows the cinematic landing page without runtime errors.

## Concrete Steps

From `/workspaces/bighouse`:

1. Install Motion:

       npm install motion

2. Add the new tab host component and landing page component with `apply_patch`.

3. Update `app/page.tsx` so it renders the tab host instead of inlining the entire dashboard markup.

4. Update `app/globals.css` with the new font and animation utilities.

5. Run a production verification build:

       npm run build

6. If needed for a manual check, run the production server:

       npm run start -- --hostname 0.0.0.0 --port 3000

## Validation and Acceptance

Run `npm run build` from `/workspaces/bighouse` and expect a successful Next.js production build with no type errors. After starting the server and signing in, navigate to `/`, confirm that a `Client Dashboard` tab is present, click it, and verify that:

- the page background turns into the cinematic black landing page rather than the normal cream dashboard;
- the floating navbar, hero video, stats strip, immersive feature card, bento grid, and combined CTA/footer all render;
- the hero and lower sections scrub the background videos as the page scrolls;
- the icon row animates into view and scales on hover;
- switching back to the overview tab still shows the original operational dashboard.

## Idempotence and Recovery

All edits are additive and can be safely re-applied if a prior attempt partially fails. `npm install motion` is idempotent and will simply record the dependency in `package.json` and `package-lock.json` if it is not already present. If the new tab build fails, the safest recovery path is to inspect the new client components and rerun `npm run build`; no schema migration or destructive data change is involved.

## Artifacts and Notes

Expected successful build tail:

    ✓ Compiled successfully
    Finished TypeScript ...
    Route (app)
    ┌ ƒ /
    ...

Manual acceptance target:

    1. Sign in at /login.
    2. Open /.
    3. Click the Client Dashboard tab.
    4. Observe the cinematic Amseta landing page and functioning scroll-linked videos.

## Interfaces and Dependencies

The new implementation will use:

- `motion` imported from `"motion/react"` for the icon-row entrance and hover animations.
- The existing Radix tab wrapper in `components/ui/tabs.tsx`.
- React refs and `requestAnimationFrame` inside a client component for scroll-linked video scrubbing.
- Existing `AppShell` chrome so the authenticated page remains anchored in the current application navigation model.

The landing-page component must expose no server-only logic. It should accept plain props or no props at all and remain safe to render inside a tab. The overview tab component should accept the already-computed values from `app/page.tsx` so the server data flow remains stable.

Revision note: Created this ExecPlan at the start of implementation after inspecting the current `/` route and confirming that the new experience must be introduced as a tabbed client component rather than a route replacement.

Revision note: Updated the plan after implementation to record the installed `motion` dependency, the new tabbed home composition, the TypeScript ref adjustment discovered during the first build, and the final production validation results.
