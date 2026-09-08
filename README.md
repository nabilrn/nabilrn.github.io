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

## Development

Requires Node.js 22 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Quality and production commands:

```bash
pnpm check
pnpm build
pnpm preview
```

The Astro production output is static and is written to `dist/`.

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

## Metrics Worker

Worker source and configuration live under `worker/`.

The Worker exposes the blog engagement endpoints plus site-analytics endpoints and stores counters in the existing `METRICS` Workers KV binding. The homepage analytics contract is strictly rolling 24 hours:

- `last24Hours` contains exactly 24 hourly buckets
- `pageviews` is the sum of those 24 hourly buckets
- `visitors` is deduplicated across visitor keys from those 24 hours
- `topPage` is aggregated only from hourly page counters in the same 24-hour window

Hourly keys use TTLs and live in the same KV namespace; no KV migration is required.

Deploy manually with:

```bash
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

Or configure `CLOUDFLARE_API_TOKEN` as a GitHub repository secret so `.github/workflows/deploy-metrics-worker.yml` can deploy Worker changes automatically.

## CI

`.github/workflows/ci.yml` runs:

1. frozen pnpm install
2. `astro check`
3. production build
4. Astro preview smoke test
5. accessibility audit against the generated sitemap

The sitemap covers the public portfolio and blog routes, so both remain part of the accessibility gate.

## Repository notes

- The site is a static Astro deployment; no Docker runtime is required.
- Generated output, local pnpm store data, environment files, and editor state are ignored.
- Google site verification is served from `public/`.
