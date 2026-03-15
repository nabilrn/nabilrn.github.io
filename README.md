# Portfolio Site

Personal portfolio built with Astro, now including:

- Profile and project landing page
- Blog (`/blog`)
- Post engagement metrics (views, likes, shares)

## Stack

- Astro (static site)
- Astro Content Collections (blog content)
- Cloudflare Worker + D1 (global engagement metrics)

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

## Blog content

Create posts in:

`src/content/blog/*.md`

Required frontmatter:

```yaml
title: "Post title"
description: "Short summary"
pubDate: 2026-03-15
tags: ["tag1", "tag2"]
featured: false
draft: false
```

## Engagement API setup (Cloudflare)

1. Install Wrangler (if needed):

```bash
pnpm dlx wrangler --version
```

2. Create D1 database:

```bash
pnpm dlx wrangler d1 create portfolio-metrics
```

3. Copy returned `database_id` into `worker/wrangler.toml`.

4. Run migration:

```bash
pnpm dlx wrangler d1 execute portfolio-metrics --file worker/migrations/0001_init.sql --remote
```

5. Deploy worker:

```bash
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

6. Set site env var:

`PUBLIC_ENGAGEMENT_API_BASE=https://<your-worker-domain>`

Put this in `.env` for local/dev build.

## Notes

- If `PUBLIC_ENGAGEMENT_API_BASE` is empty/unreachable, the UI falls back to local device metrics so the feature still works.
- Current docs collection from Starlight is still present in the repo and can be removed later if unused.
