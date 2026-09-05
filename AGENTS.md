# AGENTS.md

Astro + TypeScript portfolio. Keep changes native to the existing stack and preserve localization, SEO, theme behavior, search, projects, blog, and accessibility.

## Key paths

- `src/components/Page.astro` — global shell, fonts, theme tokens, SEO.
- `src/pages/index.astro` — shared homepage.
- `src/pages/[locale]/index.astro` — localized wrappers; do not fork the homepage.
- `src/data/siteContent.ts` — localized site copy.
- `src/data/projects.ts` — project data.
- `src/pages/dev/nrn-compare.astro` — visual comparison lab for the NR mark.
- `worker/` — engagement metrics backend.

## Skills

Use only when relevant:

- `.agents/skills/design-system/SKILL.md` — portfolio UI and typography.
- `.agents/skills/technical-isometric/SKILL.md` — NR isometric mark.

## Rules

- Reuse existing data and assets instead of duplicating them.
- Do not reintroduce the legacy terminal-theme homepage.
- Prefer semantic design tokens over one-off colors.
- Keep keyboard focus and `prefers-reduced-motion` behavior intact.
- Prototype risky visual changes in a dev surface before promoting them.
- Run `pnpm build` before completion.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```
