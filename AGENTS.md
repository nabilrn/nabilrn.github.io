# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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
- `src/pages/index.astro` — landing page: a full **interactive terminal** (`src/components/Terminal.astro`). Builds a `termData` payload (about, experience, education, skills, projects, posts, links) from `siteContent` + `projects` data and passes it to the terminal. Uses `layoutVariant="portfolio-full"`. Has a `<noscript>` fallback.
- `src/components/Terminal.astro` — self-contained shell ("nsh"): virtual filesystem (`ls`/`cd`/`cat`), ~25 commands (`help`, `neofetch`, `skills`, `projects`, `blog`, `open`, `theme`, `lang`, jokes), command history (up/down), tab completion, Ctrl+C/Ctrl+L, phosphor themes (green/amber/white). All output is driven by the `termData` prop — no fetch calls.
- `src/components/PortfolioFullLayout.astro` — top-header layout (brand prompt `nabil@nabilrn:~`, nav, language links, search, theme toggle). Used by home and projects; `blog-full` variant wraps blog pages.
- `src/components/PortfolioLayout.astro` — legacy sidebar layout, currently unused by any page.
- `src/pages/blog/index.astro` — blog listing page.
- `src/pages/blog/[slug].astro` — individual blog post page. Uses `EngagementBarNew.astro`. Article prose uses `--font-sans` (Inter); UI uses `--font-mono` (JetBrains Mono).

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

The design language is a **monochrome Linux terminal**: near-black background (`#0a0a0a`), white/grey text, JetBrains Mono as the default UI font (`--font-mono`; Inter/`--font-sans` only for long-form article prose). Color is opt-in only: the terminal's `theme green|amber` command switches phosphor colors locally. The home page IS an interactive terminal — keep UI copy emoji-free and ASCII-only. CSS variables are defined in `Page.astro` as semantic tokens: `--bg`, `--surface`, `--surface-2`, `--border`, `--border-strong`, `--text`, `--muted`, `--text-body`, `--accent` (near-white), `--accent-hover`, `--hint`, `--dir` (grey, for `ls` directories), `--ok`, `--ok-bg`, `--ok-border`, `--warn`, `--danger`, `--done`, `--shadow`, `--contrib-0..4` (greyscale contribution ramp), `--font-sans`, `--font-mono`. Fonts are self-hosted via `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` (imported in `Page.astro`). Legacy `--sl-color-*` aliases still map to these tokens. Supports `data-theme="dark"` (default) and `data-theme="light"`. Theme persisted in localStorage under `starlight-theme`.
