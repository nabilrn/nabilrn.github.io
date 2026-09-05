---
name: portfolio-design-system
description: Use for portfolio layout, typography, spacing, responsive behavior, and visual-system work. Use technical-isometric for the NR mark itself.
---

# Portfolio design system

## Direction

Clean editorial portfolio inspired by the restraint and hierarchy of ChanhDai, without copying its identity. The site is no longer terminal-themed.

## Typography

- Use a neutral modern sans for almost all UI, headings, body copy, navigation, and project titles.
- Mono is secondary only: dates, figure labels, compact metadata, code, and technical annotations.
- Avoid making the whole interface look like a terminal or developer console.
- Keep type hierarchy strong through size, weight, spacing, and contrast rather than decorative styling.

## Visual system

- Near-black/near-white neutral palette with restrained grayscale hierarchy.
- Thin borders and connected surfaces over floating dashboard cards.
- Minimal radius and shadow; use them only where they clarify grouping.
- Keep decoration sparse. Technical lines and annotations need a structural reason.
- Preserve generous negative space and clear section rhythm.
- The NR mark may be visually technical; surrounding UI should stay calm and human-readable.

## Implementation

- Keep the existing Astro + TypeScript + CSS stack.
- Prefer tokens from `src/components/Page.astro` over raw one-off colors.
- Reuse `src/data/siteContent.ts`, `src/data/projects.ts`, and existing assets.
- Preserve localization, theme behavior, SEO, search, projects, blog, and accessibility.
- Check desktop, mobile, dark/light theme, keyboard focus, and reduced motion.
- Run `pnpm build` before completion.

For NR geometry, hatch, visible edges, ruler lines, spotlight, and press interaction, use `.agents/skills/technical-isometric/SKILL.md`.
