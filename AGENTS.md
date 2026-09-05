# AGENTS.md

Shared instructions for coding agents working in this repository.

## Project

Personal portfolio for Nabil Rizki Navisa. Astro + TypeScript + CSS, deployed as a static site. Localized portfolio pages, projects, blog, search, themes, and a small Cloudflare Worker for engagement metrics are part of the same repository.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

Worker when relevant:

```bash
pnpm dlx wrangler dev --config worker/wrangler.toml
pnpm dlx wrangler deploy --config worker/wrangler.toml
```

## Important paths

- `src/components/Page.astro` — global shell, SEO, theme, fonts, and design tokens.
- `src/pages/index.astro` — shared homepage implementation.
- `src/pages/[locale]/index.astro` — localized wrappers; do not fork the homepage per locale.
- `src/data/siteContent.ts` — canonical localized profile/UI copy.
- `src/data/projects.ts` — canonical project data and screenshots.
- `src/components/GitHubContributionGrid.astro` — real contribution data behavior.
- `worker/` — engagement metrics backend.
- `src/pages/dev/nrn-compare.astro` — development-only visual lab for the isometric mark.

## Non-negotiables

- Keep the frontend native Astro + TypeScript + CSS. Do not add React/Tailwind only to imitate reference code.
- Reuse repository data and assets instead of hardcoding duplicates.
- Preserve `/projects`, `/blog`, localization, search, SEO/JSON-LD, theme behavior, and engagement metrics.
- Do not restore the removed terminal homepage or terminal-rain effect.
- Use semantic tokens before introducing raw one-off colors.
- Keep keyboard focus, accessible names, and `prefers-reduced-motion` behavior intact.
- Treat desktop references as composition guidance, not fixed coordinates for every breakpoint.

## Skills

Read the relevant skill before visual implementation work:

- General portfolio UI: `.agents/skills/design-system/SKILL.md`
- NRN / isometric / technical line-art: `.agents/skills/technical-isometric/SKILL.md`

The technical-isometric skill owns the geometry, stroke, hatch, ruler-line, occlusion, and press-interaction rules for the NRN hero mark. Do not duplicate those rules here.

## Workflow

1. Inspect the existing implementation and data before editing.
2. Prototype risky visual changes in a development surface first.
3. Prefer fewer primitives and explicit visual intent over generated complexity.
4. Run `pnpm build` before considering a change done.
5. Check desktop, mobile, theme, keyboard, and reduced-motion states when the change affects UI.
