---
name: design-system-nabilrn-nabil-github
description: Creates implementation-ready design-system guidance for the nabilrn portfolio. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

# nabilrn · Technical Bento Portfolio

## Mission
Create a precise, compact, monochrome portfolio system that feels personal and engineered rather than like a generic developer dashboard.

## Brand
- Product/brand: nabilrn / Nabil Rizki Navisa
- URL: https://portfolio.nabilrn.space
- Audience: engineering teams, recruiters, technical collaborators, and developers
- Product surface: portfolio + projects + blog

## Canonical Design Reference
Approved homepage Figma frame:
`https://www.figma.com/design/lnqCutwuWkX09ZBltufKwL/Untitled?node-id=2-2`

Use Figma as the visual source of truth for the homepage. Adapt its geometry responsively instead of copying generated React/Tailwind code verbatim.

## Style Foundations
- Dark-first editorial/technical bento composition.
- Near-black background, restrained grayscale surfaces, subtle shared borders, no colorful floating-card dashboard aesthetic.
- Structural lines and dividers create hierarchy: thin strokes, technical grids, sparse diagonal hatch separators.
- Typography hierarchy: sans for names, section headings, body, and human-readable content; mono for metadata, dates, figure labels, technical captions, and tiny controls.
- Handwritten copy is an accent for meaningful spatial annotation only. Keep it rare.
- Circular icon-only technology/social marks are preferred where the category or context already explains the icon.
- Tech/logo marks remain monochrome/grayscale by default.
- Radius is restrained; connected bento cells should visually share edges.
- Large empty areas must be intentional. Do not create whitespace simply because a card has a fixed height.

## Homepage Composition
1. Navigation — compact brand, Overview / Projects / Blog, restrained theme/search/language controls.
2. Hero — profile identity anchored low-left; original NRN isometric mark on technical grid at right; short personal sentence; role flip.
3. Overview bento — Stack / GitHub activity + Quick Info / Experience. The cells visually connect with shared borders.
4. Selected Work — myPaaS as primary feature with supporting real projects using existing screenshots.
5. Lower information — Notes / Background / Elsewhere.
6. Minimal footer.

## Interaction Language
- NRN mark: pointer-aware highlight, pressed compression, rebound. Respect `prefers-reduced-motion`.
- Role line: subtle vertical/opacity/blur cycling, never distracting.
- Links: minimal state change. Avoid decorating every clickable item with an arrow.
- Handwritten annotation can explain unusual interaction (`click around`) but must not become navigation chrome.
- Hover must never be required to discover essential information.

## Token Usage Rules
- Prefer semantic CSS custom properties and extend the token layer in `Page.astro` deliberately.
- Avoid one-off raw colors when an existing semantic token expresses the intent.
- Keep dark/light theme parity where practical.
- Contribution heatmap remains grayscale.
- Focus styles must be visible and accessible even when default borders are subtle.

## Content Rules
- Keep copy short, human, and specific.
- Prefer `Just a dude who likes building useful software, systems, and infrastructure.` over corporate self-marketing prose on the hero.
- Let project evidence and experience carry credibility rather than excessive explanatory text.
- Avoid decorative section numbering when it adds no meaning.
- Avoid repetitive `↗`/`→` glyphs across cards and headings.

## Implementation Rules
- Native stack remains Astro + TypeScript + CSS.
- Do not introduce React or Tailwind solely to reproduce Figma.
- Reuse `src/data/siteContent.ts` and `src/data/projects.ts` instead of duplicating content inside components.
- Reuse real GitHub contribution behavior from `GitHubContributionGrid.astro`.
- Use actual project assets already in the repository.
- Do not restore the removed terminal homepage, fake shell commands, ASCII boot screen, or terminal-rain canvas.

## Accessibility
- Target WCAG 2.2 AA.
- Keyboard access and visible focus are mandatory.
- Icon-only controls require accessible names/tooltips where useful.
- Motion must degrade cleanly under `prefers-reduced-motion`.
- Text contrast must remain readable despite muted visual treatment.

## Responsive Rules
- Desktop Figma is the reference for composition and proportion, not absolute breakpoint geometry.
- Collapse the 580 / 520 / 340 overview row deliberately on smaller widths.
- Preserve information hierarchy when stacking; do not simply shrink typography and cells proportionally.
- Project previews and contribution grids must avoid horizontal page overflow.

## QA Checklist
- Matches the Figma visual language at desktop size.
- No legacy terminal UI remains on the homepage.
- No repetitive decorative arrows.
- Handwritten annotations are sparse and purposeful.
- Tech/social icons are crisp, monochrome, and correctly labeled for accessibility.
- Real portfolio data and screenshots are used.
- Dark/light, keyboard, reduced-motion, tablet, and mobile states are checked.
