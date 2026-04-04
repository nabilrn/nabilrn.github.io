# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Nabil Rizki Navisa at nabilrizkinavisa.me. Built with Astro as a static site, deployed to GitHub Pages. Includes a blog with engagement metrics (views, likes, shares) powered by a Cloudflare Worker + D1 database.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build static site to ./dist
pnpm preview      # Preview production build locally
```

### Worker (Cloudflare)

```bash
pnpm dlx wrangler dev --config worker/wrangler.toml     # Run worker locally
pnpm dlx wrangler deploy --config worker/wrangler.toml   # Deploy worker
pnpm dlx wrangler d1 execute portfolio-metrics --file worker/migrations/0001_init.sql --remote  # Run D1 migration
```

### Local engagement API (MySQL alternative)

```bash
cd worker/local-server && npm install && npm start
```

Requires `.env` with `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`.

## Architecture

### Two independent deployables

1. **Astro site** (root `/`) - Static site built and deployed to GitHub Pages via `.github/workflows/deploy.yml`. Uses pnpm.
2. **Cloudflare Worker** (`worker/`) - REST API for engagement metrics. Uses D1 (SQLite) in production. Has its own `wrangler.toml`. Not part of the Astro build.

### Content system

- Blog posts live in `src/content/blog/*.md` using Astro Content Collections.
- Schema defined in `src/content.config.ts` — required frontmatter: `title`, `description`, `pubDate`, `tags`. Optional: `featured`, `draft`, `updatedDate`.
- A Starlight docs collection is still registered in `content.config.ts` but not actively used.

### Page structure

- `src/components/Page.astro` — root HTML shell with all global CSS, meta tags, JSON-LD, and theme setup. All pages use this.
- `src/components/PortfolioLayout.astro` — layout wrapper (header, nav, footer) used inside Page.
- `src/pages/index.astro` — landing page with about, experiences, projects, blog preview, skills, certifications.
- `src/pages/blog/index.astro` — blog listing page.
- `src/pages/blog/[slug].astro` — individual blog post page. Uses `EngagementBarNew.astro`.

### Engagement metrics flow

- `EngagementBarNew.astro` is the active engagement component (used on blog posts). `EngagementBar.astro` is the older version.
- Client-side JS reads `PUBLIC_ENGAGEMENT_API_BASE` env var to call the worker API at `/metrics/:postId`.
- If the API is unreachable or unset, metrics fall back to localStorage-only tracking.
- The worker API uses visitor IDs (client-generated UUIDs stored in localStorage) for view/like deduplication.
- Like is a toggle action (like/unlike). Views and shares only increment.

### Worker API endpoints

- `GET /metrics/:postId` — returns `{ views, likes, shares }`
- `POST /metrics/:postId` — body: `{ action: "view"|"like"|"share", visitorId }`. Returns updated metrics.

### Environment

- `PUBLIC_ENGAGEMENT_API_BASE` — set in `.env` for local dev, hardcoded in the GitHub Actions workflow for production builds.

### Theming

CSS variables defined in `Page.astro` with `--sl-color-*` prefix. Supports `data-theme="dark"` (default) and `data-theme="light"`. Theme persisted in localStorage under `starlight-theme`.
