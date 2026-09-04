# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Project Overview

Personal portfolio site for Nabil Rizki Navisa. Built with Astro as a static site and deployed to GitHub Pages. The site includes a localized portfolio, project catalog, blog, search, light/dark themes, and engagement metrics backed by a Cloudflare Worker + D1.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

### Worker

```bash
pnpm dlx wrangler dev --config worker/wrangler.toml
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

## Architecture

- `src/components/Page.astro` — root HTML shell, SEO/meta, JSON-LD, global tokens, font setup, and theme initialization.
- `src/components/PortfolioFullLayout.astro` — shared full-width shell used by portfolio/project/blog surfaces until the homepage redesign owns its final navigation shell.
- `src/pages/index.astro` — homepage entry point. On branch `redesign/chanhdai-bento-home`, the old terminal landing implementation has intentionally been removed and replaced by a clean redesign scaffold.
- `src/pages/[locale]/index.astro` — localized homepage wrapper. Keep one shared homepage implementation; do not fork the layout per locale.
- `src/data/siteContent.ts` — localized profile, education, experience, skills, certification, SEO, navigation, and UI copy.
- `src/data/projects.ts` — canonical project data and existing project screenshots.
- `src/components/GitHubContributionGrid.astro` — existing real GitHub contribution fetch/parser. Reuse its data behavior when recreating the Figma contribution figure.
- `src/pages/blog/*` — blog listing and article pages.
- `worker/` — independent Cloudflare Worker for engagement metrics.

## Homepage Redesign Direction

The homepage is being rebuilt from the approved Figma file:
`https://www.figma.com/design/lnqCutwuWkX09ZBltufKwL/Untitled?node-id=2-2`

The target is a restrained technical bento/editorial portfolio inspired by Chanh Dai's visual language, but using original Nabil/NRN identity and existing portfolio content.

Core visual rules:

- Near-black canvas with subtle shared structural borders; avoid floating SaaS-card styling.
- Geist-style sans for headings/body and mono only for metadata, figures, dates, labels, and technical captions.
- Thin low-contrast strokes, grid guides, technical figure captions, and sparse diagonal stripe separators.
- Handwritten annotation is rare and functional (`click around`, contextual notes), never decorative spam.
- Avoid repetitive arrow icons and redundant labels.
- Tech stack uses circular monochrome icon-only brand marks grouped under clear category labels.
- Hero uses the original NRN raised isometric mark, role-flip text, and lightweight pointer/click microinteraction.
- Use real existing project screenshots/data instead of fake placeholders when implementing Selected Work.
- Reuse the existing GitHub contribution data source rather than shipping a hard-coded activity pattern.
- Responsive/mobile behavior is required; the desktop Figma coordinates are a visual reference, not a mandate for absolute positioning at every breakpoint.

## Implementation Constraints

- Keep the site native Astro + TypeScript + CSS. Do not add React or Tailwind just because Figma design context is emitted as React/Tailwind reference code.
- Reuse semantic CSS tokens from `Page.astro`; evolve them deliberately instead of scattering raw hex values.
- Keep `/projects`, `/blog`, localization, search, SEO/JSON-LD, and engagement behavior working during the homepage migration.
- Do not restore the removed terminal homepage or terminal-rain effect.
- Do not delete reusable content/assets merely because the old homepage used them; verify references first.
- Keep accessibility: semantic heading order, keyboard interactions, visible focus, useful aria labels, reduced-motion handling.

## Engagement Metrics

- `EngagementBarNew.astro` is the active blog engagement component.
- Production API is the Cloudflare Worker; localStorage is the fallback.
- `GET /metrics/:postId`
- `POST /metrics/:postId` with `{ action: "view"|"like"|"share", visitorId }`

## Quality Gates

Before merging homepage redesign work:

1. `pnpm build` passes.
2. Existing localized routes build.
3. `/projects` and `/blog` remain functional.
4. Desktop visual output is checked against the Figma frame.
5. Tablet/mobile layouts are checked independently rather than scaled-down desktop.
6. Theme, keyboard focus, and reduced-motion behavior are verified.
