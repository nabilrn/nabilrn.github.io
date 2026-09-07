# Nabil Rizki Navisa — Portfolio

Personal portfolio and blog built as a static Astro site.

## What is in this repository

- Bento-style portfolio homepage
- Selected web-project carousel
- English and Indonesian locales
- Markdown blog and localized blog routes
- Blog engagement metrics: views, likes, and shares
- Site analytics summary used by the homepage
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

- `/` — English portfolio
- `/id/` — Indonesian portfolio
- `/blog/` — English blog index
- `/id/blog/` — Indonesian blog index
- `/blog/<slug>/` and `/id/blog/<slug>/` — articles
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
locale: en # en | id
translationKey: shared-post-key # optional, links translations
```

## Metrics Worker

Worker source and configuration live under `worker/`.

The Worker exposes the blog engagement endpoints plus site-analytics endpoints and stores counters in the `METRICS` Workers KV binding.

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

## CI

`.github/workflows/portfolio-redesign-ci.yml` currently runs:

1. frozen pnpm install
2. `astro check`
3. production build
4. Astro preview smoke test
5. accessibility audit against the generated sitemap

## Repository notes

- The site is a static Astro deployment; no Docker runtime is required.
- Generated output, local pnpm store data, environment files, and editor state are ignored.
- Google site verification is served from `public/`.
