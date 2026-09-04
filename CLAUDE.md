# CLAUDE.md

This file provides guidance to coding agents working in this repository.

## Project Overview

Personal portfolio site for Nabil Rizki Navisa. Built with Astro as a static site and deployed to GitHub Pages. It includes localized portfolio pages, projects, a blog, search, light/dark themes, and engagement metrics powered by a Cloudflare Worker + D1.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

## Architecture

- `src/components/Page.astro` — global HTML/SEO/theme/token shell.
- `src/components/PortfolioFullLayout.astro` — shared full-width navigation/layout used by existing project/blog surfaces.
- `src/pages/index.astro` — homepage entry point. On `redesign/chanhdai-bento-home`, the old interactive terminal homepage has been intentionally removed before rebuilding from Figma.
- `src/pages/[locale]/index.astro` — locale wrappers that reuse the same homepage.
- `src/data/siteContent.ts` — localized profile/content/SEO data.
- `src/data/projects.ts` — project metadata and real screenshots.
- `src/components/GitHubContributionGrid.astro` — live GitHub contribution fetch/parser; reuse its behavior.
- `src/pages/blog/*` — blog listing and post pages.
- `worker/` — independent Cloudflare Worker for engagement metrics.

## Homepage Redesign

Visual source of truth:
`https://www.figma.com/design/lnqCutwuWkX09ZBltufKwL/Untitled?node-id=2-2`

The new homepage is a compact monochrome technical-bento/editorial layout with:

- original NRN isometric hero mark and restrained microinteraction;
- short personal hero copy and rotating role line;
- connected Stack / GitHub / Quick Info / Experience overview grid;
- circular monochrome icon-only tech/social marks;
- real project screenshots in Selected Work;
- thin low-contrast strokes, technical figure captions, sparse hatch dividers;
- rare handwritten annotations such as `click around`;
- minimal decorative arrows.

Keep the implementation native Astro + TypeScript + CSS. Figma-generated React/Tailwind snippets are reference code only; do not add React or Tailwind just to reproduce them.

## Migration Rules

- Do not restore `Terminal.astro` or `TerminalRain.astro`; they were removed from the redesign branch deliberately.
- Preserve `/projects`, `/blog`, localization, search, SEO/JSON-LD, theme behavior, and engagement metrics.
- Reuse content and assets instead of hardcoding duplicates.
- Verify responsive behavior separately from the 1440px Figma reference.
- Keep keyboard/focus/reduced-motion accessibility intact.

## Engagement Metrics

`EngagementBarNew.astro` is the active blog engagement component.

- `GET /metrics/:postId`
- `POST /metrics/:postId` with `{ action: "view"|"like"|"share", visitorId }`

The Cloudflare Worker is the production backend; localStorage remains the fallback.
