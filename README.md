# Nabil Rizki Navisa — Portfolio

Personal portfolio and blog built as a static Astro site.

## What is in this repository

- Bento-style portfolio homepage
- Selected web-project carousel
- English portfolio and blog
- Markdown blog content with static article routes
- Plain string filtering on the blog index
- Portfolio-wide Ctrl/Cmd+K search
- Blog engagement metrics: views, likes, and shares
- Rolling 24-hour site analytics used by the homepage
- Cloudflare Worker metrics API backed by Workers KV

## Stack

- Astro 5
- TypeScript
- Astro Content Collections
- Inter + JetBrains Mono variable fonts
- Cloudflare Worker + Workers KV for metrics
- GitHub Actions for type/build/accessibility gates

## Local development

Requires Node.js 22 and pnpm 10.

Clone the repository and install dependencies:

```bash
git clone https://github.com/nabilrn/nabilrn.github.io.git
cd nabilrn.github.io
pnpm install
```

Start the Astro development server:

```bash
pnpm dev
```

Open `http://localhost:4321`.

Quality and production commands:

```bash
pnpm check
pnpm build
pnpm preview
```

The Astro production output is static and is written to `dist/`.

The portfolio can run without the metrics backend. When no metrics API is configured during local development, analytics and engagement values stay in an unavailable state instead of showing synthetic preview data. To use real metrics locally, configure the shared API base described below and allow `http://localhost:4321` in the Worker CORS allowlist.

## Routes

The public site currently exposes:

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
featured: false
draft: false
```

The blog index intentionally uses a simple client-side substring filter over title, description, and tags. Full article-body search belongs to the global Ctrl/Cmd+K search instead.

## Metrics Worker and Workers KV

Worker source and configuration live under `worker/`.

The Worker provides two related features:

- blog engagement counters for views, likes, and shares;
- site analytics used by the homepage.

Both use the `METRICS` Cloudflare Workers KV binding. The homepage analytics contract is strictly rolling 24 hours:

- `last24Hours` contains exactly 24 hourly buckets;
- `pageviews` is the sum of those 24 hourly buckets;
- `visitors` is deduplicated across visitor keys from those 24 hours;
- `topPage` is aggregated only from hourly page counters in the same 24-hour window.

Hourly keys use TTLs and live in the same KV namespace. A separate database or KV migration is not required.

### Set up your own Worker and KV namespace

A fork should use its **own Cloudflare account, Worker, and KV namespace**. Do not reuse the account ID or KV namespace ID committed for the original deployment.

Authenticate Wrangler:

```bash
pnpm dlx wrangler login
pnpm dlx wrangler whoami
```

Update `worker/wrangler.toml` for your Cloudflare account. A fork should end up with configuration equivalent to:

```toml
name = "portfolio-metrics-api"
main = "src/index.ts"
compatibility_date = "2026-03-15"
account_id = "<YOUR_CLOUDFLARE_ACCOUNT_ID>"
workers_dev = true

[vars]
ALLOWED_ORIGIN = "http://localhost:4321,https://your-domain.example"

[[kv_namespaces]]
binding = "METRICS"
id = "<YOUR_KV_NAMESPACE_ID>"
```

Create the KV namespace after setting your account information:

```bash
pnpm dlx wrangler kv namespace create METRICS --config worker/wrangler.toml
```

Wrangler returns a generated namespace ID. Put that ID in the `[[kv_namespaces]]` block as the `METRICS` binding.

`ALLOWED_ORIGIN` is a comma-separated CORS allowlist. Include every frontend origin that should be allowed to send analytics/engagement writes. Add `http://localhost:4321` if you want the remote Worker to accept writes from the local Astro development server.

Deploy the Worker manually:

```bash
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

Wrangler will print the deployed `workers.dev` URL. A typical endpoint looks like:

```text
https://portfolio-metrics-api.<your-workers-subdomain>.workers.dev
```

You can verify the analytics API with:

```bash
curl https://portfolio-metrics-api.<your-workers-subdomain>.workers.dev/analytics/summary
```

A current Worker response contains `generatedAt`, `visitors`, `pageviews`, `topPage`, and exactly 24 entries under `last24Hours`.

### Point a fork at its own Worker

Copy `.env.example` to `.env` and set the shared frontend metrics API base:

```bash
PUBLIC_ENGAGEMENT_API_BASE=https://portfolio-metrics-api.<your-workers-subdomain>.workers.dev
```

Despite the historical variable name, this single value now controls both homepage analytics and blog engagement. Production falls back to the original public Worker when the variable is unset; local development does not use that production fallback, so metrics remain unavailable until you opt in by setting the variable.

When this variable is configured locally, local page visits send real analytics writes to that Worker. Make sure the Worker's `ALLOWED_ORIGIN` includes `http://localhost:4321` if you want that behavior.

Never commit Cloudflare API tokens or other credentials. The KV namespace ID and account ID are identifiers, not authentication secrets, but forks should still replace the original deployment identifiers with their own resources.

Worker deployment is intentionally **manual** in this repository. There is no GitHub Actions workflow that publishes the Cloudflare Worker automatically.

## CI

`.github/workflows/ci.yml` runs:

1. frozen pnpm install
2. `astro check`
3. production build
4. Astro preview smoke test
5. accessibility audit against the generated sitemap

The sitemap covers the public portfolio and blog routes, so both remain part of the accessibility gate.

## Use, fork, and remix

This portfolio is open source under the [MIT License](LICENSE).

You are free to fork, copy, modify, redesign, and use the repository for personal or commercial projects. Keep the original copyright and license notice as required by the MIT License. Third-party dependencies and assets, where applicable, remain subject to their own licenses.

If this repository helps you or becomes a starting point for your own portfolio, a GitHub star is appreciated. A star is not a condition of the license.

This repository is maintained as my personal portfolio and is **not accepting external code contributions or pull requests**. If you want to change or extend it, please fork the repository and maintain your own version. See [CONTRIBUTING.md](CONTRIBUTING.md) for the repository policy.

## Repository notes

- The site is a static Astro deployment; no Docker runtime is required.
- Generated output, local pnpm store data, environment files, and editor state are ignored.
- Google site verification is served from `public/`.
