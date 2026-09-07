# AGENTS.md

Astro + TypeScript portfolio. Keep changes native to the existing stack and preserve SEO, theme behavior, search, projects, blog, and accessibility.

## Key paths

- `src/components/Page.astro` — global shell, fonts, theme tokens, and SEO.
- `src/pages/index.astro` — portfolio homepage.
- `src/pages/blog/index.astro` — blog index and client-side article search.
- `src/pages/blog/[slug].astro` — static blog article route.
- `src/content/blog/` — Markdown blog content.
- `src/data/siteContent.ts` — single-language site copy and schema metadata.
- `src/data/projects.ts` — project data.
- `worker/` — engagement metrics backend.

## Skills

Use only when relevant:

- `.agents/skills/design-system/SKILL.md` — portfolio UI and typography.
- `.agents/skills/technical-isometric/SKILL.md` — NR isometric mark.

## Rules

- Reuse existing data and assets instead of duplicating them.
- Keep the public site English-only unless localization is explicitly requested again; do not recreate locale route wrappers or locale helper infrastructure by default.
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