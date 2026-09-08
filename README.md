# Nabil Rizki Navisa — Portfolio

Personal portfolio and blog built as a static Astro site.

## What is in this repository

- Bento-style portfolio homepage
- Selected web-project carousel
- English portfolio and blog
- Markdown blog content with static article routes
- Plain string filtering on the blog index
- Portfolio-wide Ctrl/Cmd+K search
- Curated component gallery with live previews and source code
- A–Z technical isometric mark generator
- Blog engagement metrics: views, likes, and shares
- Strict 24-hour site analytics summary used by the homepage
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
- `/components/` — curated component previews and source code
- `/components/isometric-generator/` — A–Z technical isometric generator
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

## Component gallery

`/components/` is intentionally curated rather than a source-tree inspector. Each public block contains a live preview and the actual component source. Internal orchestration components are not exposed as gallery entries.

The GitHub contribution graph is adapted from Chánh Đại's MIT-licensed implementation; Chánh Đại credits Kibo UI for the generic contribution graph primitive. The portfolio keeps that provenance visible in the gallery.

## Metrics Worker

Worker source and configuration live under `worker/`.

The Worker exposes the blog engagement endpoints plus site-analytics endpoints and stores counters in the `METRICS` Workers KV binding. The analytics summary contract returns exactly 24 hourly buckets in `last24Hours`.

For a separate deployment:

1. Create a Cloudflare Workers KV namespace.
2. Bind it as `METRICS` in `worker/wrangler.toml`.
3. Set `ALLOWED_ORIGIN` to the portfolio origins that may call the Worker.
4. Deploy:

```bash
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

Production frontend code defaults to the portfolio metrics Worker. To test against another compatible endpoint, set:

```bash
PUBLIC_ENGAGEMENT_API_BASE=https://your-worker.example
```

The homepage never renders the legacy 30-day chart. If an older Worker is still deployed, it keeps a 24-bucket zero-state until the hourly Worker contract is available.

## CI

`.github/workflows/portfolio-redesign-ci.yml` currently runs:

1. frozen pnpm install
2. `astro check`
3. production build
4. Astro preview smoke test
5. accessibility audit against the generated sitemap

The sitemap includes the public component gallery and isometric generator, so both are part of the accessibility gate.

## Repository notes

- The site is a static Astro deployment; no Docker runtime is required.
- Generated output, local pnpm store data, environment files, and editor state are ignored.
- Google site verification is served from `public/`.
