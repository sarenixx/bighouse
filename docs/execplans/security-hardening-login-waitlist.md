# Security hardening for login redirects and waitlist intake

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

This document follows `/workspaces/bighouse/PLANS.md` and must be maintained in accordance with that file.

## Purpose / Big Picture

This change prevents common abuse paths on the public site and intake endpoints: open redirects after login, bot spam on the email capture form, weak client IP extraction for rate limiting, and missing baseline browser security headers. After this work, users still see the same login and “receive example report” experience, but malicious requests are blocked more often and sensitive flows are safer by default.

## Progress

- [x] (2026-04-20 01:28Z) Added redirect sanitization utility and applied it in both login page parsing and client redirect navigation.
- [x] (2026-04-20 01:31Z) Updated request IP extraction to prefer `cf-connecting-ip` before fallback headers.
- [x] (2026-04-20 01:38Z) Added global security headers in `next.config.ts`, including CSP and transport protections.
- [x] (2026-04-20 01:42Z) Hardened waitlist API with honeypot support, minimum form-fill timing checks, optional Turnstile verification, and optional email-confirmation flow with signed tokens.
- [x] (2026-04-20 01:44Z) Updated landing form to include honeypot input, Turnstile widget callbacks, and expanded request payload fields.
- [x] (2026-04-20 01:46Z) Updated `.env.example`, `.dev.vars.example`, and README configuration notes for the new controls.
- [x] (2026-04-20 01:47Z) Ran validation (`npm test`, `npm run build`) successfully.

## Surprises & Discoveries

- Observation: Full-repo lint (`eslint .`) hung in this environment without completing.
  Evidence: command produced startup output and never returned; targeted lint on touched files completed successfully.
- Observation: Turnstile integration needs both client and server configuration to truly enforce bot checks.
  Evidence: client-side token presence can be bypassed unless `TURNSTILE_SECRET_KEY` is set and validated in the API route.

## Decision Log

- Decision: Restrict post-login redirects to same-origin relative paths and disallow `/api/*` targets.
  Rationale: Prevents open redirect and endpoint misuse while preserving user-return paths.
  Date/Author: 2026-04-20 / Codex

- Decision: Use layered anti-bot controls (honeypot + timing + optional Turnstile) instead of a single gate.
  Rationale: Low-friction baseline defenses still work even when CAPTCHA is not configured.
  Date/Author: 2026-04-20 / Codex

- Decision: Add optional double opt-in confirmation before sending the PDF report.
  Rationale: Reduces abuse and improves mailbox integrity for CTA leads when enabled.
  Date/Author: 2026-04-20 / Codex

- Decision: Keep all new protections configurable through environment variables.
  Rationale: Supports phased rollout and operational flexibility across staging/production.
  Date/Author: 2026-04-20 / Codex

## Outcomes & Retrospective

The work delivered the intended protections without breaking the current product flow. Tests and production build both passed. The only unresolved friction was full-repo lint stalling in this environment; targeted lint and full build/test provided practical validation for this release. Future hardening can focus on stronger CSP tightening (removing unsafe directives) once script requirements are fully inventoried.

## Context and Orientation

This repository is a Next.js application deployed through OpenNext to Cloudflare. The login experience lives in `app/login/page.tsx` and `components/login-form.tsx`. Public lead capture is implemented in `components/client-dashboard-landing.tsx` and submitted to `app/api/waitlist/route.ts`. Rate-limit IP extraction helper logic is in `lib/server/login-rate-limit.ts`. Shared utility code is in `lib/utils.ts`. App-level response headers are configured in `next.config.ts`.

The waitlist route persists entries in Prisma and can send email either through a Cloudflare Email binding or Cloudflare Email REST API fallback. This plan extends that route with anti-bot checks and a signed confirmation-token path for optional double opt-in.

## Plan of Work

Update redirect handling first so any caller-provided `from` parameter is normalized to a safe internal path. Then strengthen source-IP capture used by rate limiting to prioritize Cloudflare’s canonical edge IP header. Add security response headers at the framework level so every route and page gets a consistent baseline policy.

Next, harden the waitlist API route by extending its schema and control flow: accept honeypot and timing fields, verify Turnstile when configured, and optionally switch from immediate PDF send to confirmation-email-first behavior. Add a GET confirmation handler that verifies HMAC-signed tokens, sends the PDF after confirmation, updates status, and redirects back to the landing page with outcome query parameters.

Finally, wire the landing CTA form to send the new fields and render the Turnstile widget when a site key exists. Update environment examples and README so operators can enable each control intentionally.

## Concrete Steps

From `/workspaces/bighouse`:

1. Implement redirect sanitization utility in `lib/utils.ts` and call it from login page + login form.
2. Update `lib/server/login-rate-limit.ts` to prioritize `cf-connecting-ip`.
3. Add global headers in `next.config.ts` with CSP, frame/type/referrer/permissions/HSTS protections.
4. Extend `app/api/waitlist/route.ts` with:
   - expanded schema fields,
   - Turnstile verification helper,
   - optional confirmation token helpers and confirmation email path,
   - `GET` handler for confirmation,
   - updated `POST` flow with anti-bot checks and optional double opt-in behavior.
5. Update `components/client-dashboard-landing.tsx` to submit honeypot/timing/turnstile fields and render Turnstile script/widget when configured.
6. Document new variables in `.env.example`, `.dev.vars.example`, and README.
7. Validate with:
   - `npm test`
   - `npm run build`

Expected validation indicators:
- Vitest output ends with all tests passed.
- Next.js build completes with route manifest and no TypeScript errors.

## Validation and Acceptance

Run `npm test` and expect all test files and tests to pass. Run `npm run build` and expect a successful production build with route summary.

Manual acceptance checks:
- Visiting `/login?from=https://example.com` should not redirect externally after login.
- Waitlist submission with empty honeypot and valid email should still return success response.
- When `TURNSTILE_SECRET_KEY` is configured, requests without a valid Turnstile token should be rejected.
- When `WAITLIST_REQUIRE_CONFIRMATION=true`, initial submission sends confirmation email and PDF send is deferred until link click.

## Idempotence and Recovery

These changes are additive and safe to reapply. Environment variables default to non-breaking behavior (`WAITLIST_REQUIRE_CONFIRMATION=false`, Turnstile disabled when no secret/site key is provided). If a deployment issue occurs, recovery can be done by unsetting new environment flags while keeping code deployed.

## Artifacts and Notes

Validation transcript excerpts:

    npm test
    ...
    Test Files 11 passed (11)
    Tests 30 passed (30)

    npm run build
    ...
    ✓ Compiled successfully
    Finished TypeScript
    ✓ Generating static pages

Touched files:

- `lib/utils.ts`
- `app/login/page.tsx`
- `components/login-form.tsx`
- `lib/server/login-rate-limit.ts`
- `next.config.ts`
- `app/api/waitlist/route.ts`
- `components/client-dashboard-landing.tsx`
- `.env.example`
- `.dev.vars.example`
- `README.md`

## Interfaces and Dependencies

The waitlist route continues to use Prisma (`waitlistEntry`) and existing rate-limit helpers. New external dependency behavior uses Cloudflare Turnstile verification endpoint (`https://challenges.cloudflare.com/turnstile/v0/siteverify`). Signed confirmation tokens are generated with Node-compatible HMAC-SHA256 from `node:crypto` and validated with timing-safe comparison.

Required environment knobs introduced:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (optional client rendering)
- `TURNSTILE_SECRET_KEY` (optional server verification)
- `TURNSTILE_EXPECTED_HOSTNAME` (optional host pinning)
- `WAITLIST_REQUIRE_CONFIRMATION` (optional double opt-in)
- `WAITLIST_CONFIRMATION_SECRET` (required when confirmation is enabled)

Revision note: 2026-04-20 — Initial ExecPlan added retroactively to document completed security hardening and operational settings introduced during implementation.
