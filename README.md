# Nabil Rizki Navisa — Portfolio

Personal portfolio and blog built with Astro and deployed as a static site.

## What is in this repository

- Bento-style portfolio homepage
- Selected project carousel and component previews
- English portfolio and Markdown blog
- Client-side internal navigation with Astro `ClientRouter`
- Portfolio-wide Ctrl/Cmd+K search
- Plain string filtering on the blog index
- Blog engagement metrics: views, likes, and shares
- Rolling 24-hour site analytics used by the homepage
- Cloudflare Worker metrics API backed by Cloudflare D1

## Stack

- Astro 5
- TypeScript
- Astro Content Collections
- Inter + JetBrains Mono variable fonts
- Cloudflare Worker + D1 for metrics and rolling analytics
- GitHub Actions for type/build/accessibility gates

The site itself remains statically generated. Astro client routing only changes how internal page transitions are performed in the browser.

## Local development

Requires Node.js 22 and pnpm 10.

```bash
git clone https://github.com/nabilrn/nabilrn.github.io.git
cd nabilrn.github.io
pnpm install
pnpm dev
```

Open `http://localhost:4321`.

Quality and production commands:

```bash
pnpm check
pnpm build
pnpm preview
```

The production output is written to `dist/`.

The portfolio can run without the metrics backend. During local development, metrics stay unavailable unless `PUBLIC_ENGAGEMENT_API_BASE` is configured. Local homepage previews may read the remote analytics summary but do not record homepage analytics views.

## Routes

- `/` — portfolio homepage
- `/blog/` — blog index with local string filtering
- `/blog/<slug>/` — blog articles
- `/search-index.json` — build-time global-search index
- `/404/` — custom not-found page
- `/sitemap.xml` — custom sitemap

Projects are presented directly on the homepage; there is no standalone `/projects/` route.

## Blog content

Posts live in `src/content/blog/*.md`.

Frontmatter schema:

```yaml
title: "Post title"
description: "Short summary"
pubDate: 2026-03-15
updatedDate: 2026-03-20 # optional
tags: ["tag1", "tag2"]
draft: false
```

The blog index intentionally uses a simple client-side substring filter over title, description, and tags. Full article-body search belongs to the global Ctrl/Cmd+K search.

## Metrics Worker and D1

Worker source and configuration live under `worker/`.

The Worker provides:

- per-post views, likes, and shares;
- per-visitor viewed/liked state;
- rolling 24-hour pageviews and unique visitors;
- the homepage top-page summary.

Cloudflare D1 is the source of truth. Engagement counters use atomic SQL updates instead of KV read-modify-write counters. Rolling analytics is stored in hourly D1 rows, so `/analytics/summary` no longer scans KV prefixes.

The public API contract is:

- `GET /metrics/<post-id>`
- `POST /metrics/<post-id>` with `view`, `like`, or `share`
- `POST /analytics/view`
- `GET /analytics/summary`

`last24Hours` always represents 24 hourly buckets. `pageviews`, `visitors`, and `topPage` are derived from that rolling window.

### Legacy KV during the current production cutover

The original deployment still binds the former KV namespace as `LEGACY_METRICS` in **read-only** mode. It is used only to reconcile historical engagement values into D1 while the migration is being verified. New writes go to D1.

The old D1 `post_views` and `post_likes` tables are also retained temporarily as rollback data. `worker/migrations/0002_import_legacy_d1.sql` imports that historical per-visitor state into the consolidated schema.

A fresh fork does not need this compatibility layer. Remove the `[[kv_namespaces]]` block from `worker/wrangler.toml` when there is no legacy KV data to import.

## Set up a fresh Cloudflare Worker + D1

A fork should use its **own Cloudflare account, Worker, and D1 database**. Do not reuse the deployment identifiers committed for this portfolio.

Authenticate Wrangler:

```bash
pnpm dlx wrangler login
pnpm dlx wrangler whoami
```

Create a D1 database:

```bash
cd worker
npx wrangler d1 create portfolio-metrics
```

Put the returned database UUID into `worker/wrangler.toml`:

```toml
name = "portfolio-metrics-api"
main = "src/index.ts"
compatibility_date = "2026-03-15"
account_id = "<YOUR_CLOUDFLARE_ACCOUNT_ID>"
workers_dev = true

[vars]
ALLOWED_ORIGIN = "https://your-domain.example"

[[d1_databases]]
binding = "DB"
database_name = "portfolio-metrics"
database_id = "<YOUR_D1_DATABASE_ID>"
migrations_dir = "migrations"
```

For a fresh installation, remove the legacy `[[kv_namespaces]]` block from the checked-in config.

Apply the schema:

```bash
npx wrangler d1 migrations apply portfolio-metrics --remote
```

Deploy the Worker:

```bash
npx wrangler deploy
```

Wrangler prints the deployed `workers.dev` URL. Verify it with:

```bash
curl https://portfolio-metrics-api.<your-workers-subdomain>.workers.dev/analytics/summary
```

`ALLOWED_ORIGIN` is a comma-separated CORS allowlist. Include every frontend origin allowed to send metric writes. Add localhost only if you intentionally want local blog interactions to reach the remote Worker.

### Point the frontend at your Worker

Copy `.env.example` to `.env` and set:

```bash
PUBLIC_ENGAGEMENT_API_BASE=https://portfolio-metrics-api.<your-workers-subdomain>.workers.dev
```

This single API base controls homepage analytics and blog engagement.

The original production portfolio falls back to its deployed Worker URL when this variable is unset. Local development does not use that production fallback.

Never commit Cloudflare API tokens or other credentials. Account IDs, D1 database IDs, and KV namespace IDs are resource identifiers rather than authentication secrets, but forks should still use their own resources.

Worker deployment is intentionally manual; GitHub Actions does not publish the Cloudflare Worker.

For the current production cutover procedure, see [`worker/D1_SETUP.md`](worker/D1_SETUP.md).

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`:

1. frozen pnpm install
2. Astro check
3. production build
4. Astro preview smoke test
5. accessibility audit against the generated sitemap

The sitemap covers the public portfolio and blog routes, so both remain part of the accessibility gate.

`.github/workflows/daily-refresh.yml` refreshes profile data fetched at Astro build time, currently the GitHub contribution graph and Duolingo streak. It runs once per day at 00:10 UTC (07:10 WIB) and can also be started manually with `workflow_dispatch`.

The refresh job validates a frozen install, `astro check`, and production build first. It then calls the MyPaaS project deploy API directly instead of creating an empty commit on `main`, so scheduled refreshes do not pollute repository history or recursively trigger the normal CI workflow.

Configure these repository Actions secrets for the scheduled deploy step:

- `MYPAAS_API_URL` — MyPaaS API base ending in `/api`
- `MYPAAS_API_TOKEN` — bearer token authorized to deploy the portfolio project
- `MYPAAS_PROJECT_ID` — UUID of the portfolio project in MyPaaS

If any required secret is missing, the refresh job fails explicitly instead of mutating repository history or silently pretending the static data was refreshed.

The daily refresh only redeploys the static portfolio. It does not deploy the Cloudflare Worker or modify D1.

## Use, fork, and remix

This portfolio is open source under the [MIT License](LICENSE).

You are free to fork, copy, modify, redesign, and use the repository for personal or commercial projects. Keep the original copyright and license notice as required by the MIT License. Third-party dependencies and assets remain subject to their own licenses.

If this repository helps you or becomes a starting point for your own portfolio, a GitHub star is appreciated. A star is not a condition of the license.

This repository is maintained as my personal portfolio and is **not accepting external code contributions or pull requests**. If you want to change or extend it, fork the repository and maintain your own version. See [CONTRIBUTING.md](CONTRIBUTING.md) for the repository policy.

## Repository notes

- The site is a static Astro deployment; no Docker runtime is required.
- Generated output, local pnpm store data, environment files, and editor state are ignored.
- Google site verification is served from `public/`.
