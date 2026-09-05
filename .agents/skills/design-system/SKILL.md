---
name: design-system-nabilrn-portfolio
description: Use for general portfolio layout, component, typography, spacing, token, responsive, and content presentation work. Do not use this as the detailed NRN isometric-mark specification; load technical-isometric for that.
---

# nabilrn Portfolio Design System

## Goal

Build a compact, monochrome, technical/editorial portfolio that feels engineered and personal, not like a generic SaaS dashboard.

## Reference

Homepage Figma reference:
`https://www.figma.com/design/lnqCutwuWkX09ZBltufKwL/Untitled?node-id=2-2`

Use it for composition and hierarchy. Keep implementation responsive and native to Astro rather than translating generated framework code literally.

## Visual language

- Near-black/near-white theme with restrained grayscale hierarchy.
- Connected surfaces and shared borders are preferred over floating cards.
- Sans for human-readable content; mono for metadata, dates, figures, and technical captions.
- Thin low-contrast dividers and sparse technical details; decoration must have a reason.
- Handwritten annotation is rare and contextual.
- Tech/social marks remain crisp and monochrome when context already identifies them.
- Radius and shadows are restrained.
- Empty space must support hierarchy, not compensate for arbitrary fixed heights.

## Content and interaction

- Keep copy short, specific, and human.
- Let real projects, screenshots, and experience carry credibility.
- Avoid repetitive arrows, badges, labels, and decorative numbering.
- Hover is enhancement only; essential information must remain discoverable without it.
- Motion stays subtle and respects `prefers-reduced-motion`.

## Implementation

- Astro + TypeScript + CSS only unless a feature genuinely requires another runtime.
- Prefer semantic tokens from `Page.astro` over one-off raw colors.
- Reuse `src/data/siteContent.ts`, `src/data/projects.ts`, and existing assets.
- Reuse existing live contribution behavior rather than hardcoding activity.
- Preserve localization, SEO, theme, search, projects, blog, and accessibility.

## Responsive and QA

- Preserve hierarchy when stacking; do not merely shrink desktop geometry.
- Avoid horizontal overflow in project previews and data visualizations.
- Check dark/light, keyboard focus, reduced motion, desktop, tablet, and mobile.
- Run `pnpm build` before completion.

## Specialized visual work

For the NRN hero mark, modular lettering, isometric projection, hatch, stroke visibility, technical ruler lines, cursor spotlight, or pressed-depth interaction, load:

`.agents/skills/technical-isometric/SKILL.md`
