# Amseta

Amseta is a Next.js 16 portfolio-oversight demo with a branded public landing page, authenticated dashboard views, seeded demo data, PDF exports, and a Cloudflare Workers + D1 deployment path.

## Stack

- Next.js 16 App Router
- React 19
- Prisma 7
- SQLite for local development
- Cloudflare D1 for preview and production
- OpenNext Cloudflare adapter
- Vitest and Playwright

## Local setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

3. Set the demo credentials in `.env`.

   ```dotenv
   DEMO_USER_EMAIL="client@amseta.com"
   DEMO_USER_PASSWORD="choose-a-strong-demo-password"
   ```

4. Create and seed the local SQLite database.

   ```bash
   npm run db:prepare
   ```

5. Start the app.

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000/login` and sign in with the credentials from `.env`.

## Core scripts

- `npm run dev`: start local Next.js development
- `npm run build`: run a production Next.js build
- `npm run start`: serve the production build locally
- `npm test`: run the Vitest suite
- `npm run test:e2e`: run Playwright tests
- `npm run db:generate`: regenerate Prisma client
- `npm run db:push`: apply the Prisma schema to local SQLite
- `npm run db:seed`: seed local SQLite or remote D1 depending on environment variables
- `npm run db:seed:local`: force local SQLite seeding
- `npm run db:backfill:scoreboard`: backfill missing property scoreboard JSON fields in local SQLite or remote D1 depending on environment variables
- `npm run db:backfill:scoreboard:local`: force the property scoreboard backfill against local SQLite
- `npm run cf-typegen`: regenerate `cloudflare-env.d.ts`
- `npm run preview`: build for Cloudflare and preview locally
- `npm run deploy`: build for Cloudflare and deploy
- `npm run bootstrap:cloudflare`: first-time remote bootstrap that migrates, seeds, and deploys
- `npm run release:cloudflare`: repeatable remote release that migrates and deploys without reseeding

## Cloudflare local preview

The app uses local SQLite during normal Node development and the `DB` D1 binding during Cloudflare preview and production.

1. Create a local Workers vars file if needed.

   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Generate Cloudflare env typings.

   ```bash
   npm run cf-typegen
   ```

3. Start the Workers preview.

   ```bash
   npm run preview
   ```

If preview needs authenticated data, make sure the D1 database declared in `wrangler.jsonc` already exists and has received migrations plus seed data.

## Cloudflare D1 and deployment

The production Worker expects a D1 binding named `DB`.

1. Authenticate Wrangler.

   ```bash
   npx wrangler login
   ```

2. Create the D1 database if it does not exist yet.

   ```bash
   npx wrangler d1 create amseta-prod
   ```

3. Copy the returned `database_id` into `wrangler.jsonc` under `d1_databases[0].database_id`.

4. Apply the checked-in schema migrations to the remote database.

   ```bash
   npx wrangler d1 migrations apply amseta-prod --remote
   ```

5. Export the Cloudflare credentials needed for remote seeding.

   ```bash
   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   export CLOUDFLARE_DATABASE_ID="your-d1-database-id"
   export CLOUDFLARE_D1_TOKEN="your-api-token"
   export DEMO_USER_EMAIL="client@amseta.com"
   export DEMO_USER_PASSWORD="choose-a-strong-demo-password"
   ```

6. Seed the remote D1 database once for the initial environment bootstrap.

   ```bash
   npm run db:seed
   ```

7. Deploy the Worker.

   ```bash
   npm run deploy
   ```

For a first-time environment bootstrap after you have exported the required Cloudflare and demo-user environment variables, you can run:

```bash
npm run bootstrap:cloudflare
```

That script applies schema migrations, seeds the remote database, deploys the Worker, and then prints the post-deploy smoke checks.

For normal follow-up releases after the environment has already been seeded, run:

```bash
npm run release:cloudflare
```

That script runs the local validation gates, checks Wrangler auth, applies any new schema migrations, backfills any missing property scoreboard JSON fields on remote D1, deploys the Worker, and then prints the post-deploy smoke checks. It does not reseed production data. Make sure `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, and `CLOUDFLARE_D1_TOKEN` are still exported in the shell before you run it.

## CTA email delivery (Cloudflare Email)

The landing-page CTA (`/api/waitlist`) stores the lead and then attempts to send an attached Amseta Example Report Card PDF.

1. Onboard your sending domain in Cloudflare Email Sending.
2. Confirm `wrangler.jsonc` has the `send_email` binding named `EMAIL`.
3. Set Worker vars for sender and report URL:

   ```bash
   npx wrangler secret put EMAIL_FROM_ADDRESS
   npx wrangler secret put EMAIL_REPORT_URL
   ```

   Typical values:
   - `EMAIL_FROM_ADDRESS=hello@amseta.com`
   - `EMAIL_REPORT_URL=https://amseta.com/demo`

4. Optional bot protection and confirmation settings:
   - Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in your build environment to render a Turnstile challenge on the public form.
   - Set `TURNSTILE_SECRET_KEY` (Worker secret) to enforce server-side Turnstile verification.
   - Set `TURNSTILE_EXPECTED_HOSTNAME=amseta.com` to pin challenge validation to your hostname.
   - Set `WAITLIST_REQUIRE_CONFIRMATION=true` and `WAITLIST_CONFIRMATION_SECRET=<long-random-secret>` to require email confirmation before sending the PDF report.

5. Deploy with `npm run deploy`.

If the binding is not available, the route can fall back to Cloudflare Email REST API when these environment variables are set:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_EMAIL_API_TOKEN`

## Custom domain

`wrangler.jsonc` already declares custom-domain routes for `amseta.com` and `www.amseta.com`.

After deployment:

1. Confirm both hostnames are active in the same Cloudflare account as the Worker.
2. Re-run `npm run deploy` after any route changes.
3. Verify in the Cloudflare dashboard that the Worker has both custom domains attached.
4. Confirm the generated DNS records exist and are proxied through Cloudflare.
5. Visit `https://amseta.com`, `https://www.amseta.com`, and `https://amseta.com/login` to verify the live route and auth path.

## Notes and caveats

- `lib/server/prisma.ts` switches between `better-sqlite3` and `@prisma/adapter-d1` at runtime.
- `prisma/seed.ts` can seed local SQLite or remote D1 with the same dataset, but it is intentionally a bootstrap tool rather than part of the normal release path.
- `prisma/backfill-property-score-inputs.ts` is an idempotent maintenance script that fills only missing property scoreboard JSON fields unless you pass `--force` or set `BACKFILL_SCOREBOARD_FORCE=1`.
- Production rate limiting now prefers the existing Cloudflare D1 binding for shared counters, falls back to Redis when configured outside the Worker runtime, and uses local memory only for development and tests.
- `middleware.ts` is intentionally kept even though Next.js 16 warns that `proxy.ts` is the newer convention. In this repo, the OpenNext Cloudflare build currently succeeds with `middleware.ts` and fails with `proxy.ts`.
- Generated Cloudflare build output lives under `.open-next/` and Wrangler state may appear under `.wrangler/`.
- `npm run bootstrap:cloudflare` is for first-time environment setup and demo-data seeding.
- `npm run release:cloudflare` is for repeatable production releases and intentionally avoids reseeding.

## Validation snapshot

Current repo validation target:

```bash
npm test
npm run build
```

At the time of this update, both commands pass in `/workspaces/bighouse`.
