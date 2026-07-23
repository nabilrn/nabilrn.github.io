---
name: design-system-nabilrn-nabil-github
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# nabilrn (Nabil) · Monochrome Terminal ("nsh")

## Mission
Deliver implementation-ready design-system guidance for nabilrn (Nabil) · Monochrome Terminal that can be applied consistently across portfolio and blog interfaces.

## Brand
- Product/brand: nabilrn (Nabil) · Monochrome Terminal — the home page is a real interactive shell ("nsh"), not a terminal-styled page
- URL: https://portfolio.nabilrn.space
- Audience: developers and technical teams
- Product surface: portfolio site + blog

## Style Foundations
- Visual style: authentic monochrome Linux terminal. Dark-first, near-black, white/grey text, monospace UI, block cursor, ASCII-only UI copy (no emoji anywhere). Color is opt-in only — `theme green|amber` inside the terminal.
- Interactive core: `src/components/Terminal.astro` — virtual FS (`ls`/`cd`/`cat`), ~25 commands, history, tab completion, Ctrl+C/L, phosphor themes (white default, green/amber opt-in). Boot shows a one-line ASCII name banner beside a grayscale pixel portrait, then an `overview` gate on ENTER. All content via the `termData` prop.
- Main font style: `font.family.mono=var(--font-mono)` (JetBrains Mono Variable, self-hosted) for all UI; `font.family.sans=var(--font-sans)` (Inter Variable) only for long-form article prose; `font.size.base=14px`
- Color tokens (dark, default): `--bg=#0a0a0a`, `--surface=#111111`, `--surface-2=#181818`, `--border=#1f1f1f`, `--border-strong=#2e2e2e`, `--text=#e8e8e8`, `--muted=#8a8a8a`, `--text-body=#b8b8b8`, `--accent=#f0f0f0`, `--accent-hover=#ffffff`, `--hint=#d4d4d4`, `--dir=#b8b8b8` (ls directories), `--warn=#fbbf24`, `--danger=#f87171`
- Light theme: same token names with light values defined in `Page.astro`
- Contribution heatmap ramp: greyscale `--contrib-0..4` (#161616 → #c0c0c0 dark)
- Radius: 6-8px (terminal window chrome, cards); full radius 999px only for pills/chips
- Motion: cursor blink (steps), `150ms ease` color transitions; respect `prefers-reduced-motion`

## Token Usage Rules
- Always use semantic tokens (`var(--text)`), never raw hex or the retired `--gh-*` names.
- The palette is monochrome by default — do not introduce accent colors; phosphor green/amber exist only inside the terminal's opt-in `theme` command (hardcoded there, not in tokens).
- Prompt format: `visitor@nabilrn:~$` — user/host in terminal `--ph` color (default `--text`), path in default text.
- `ls` directories use `--dir` (grey, bold) with trailing `/`; errors use `--danger`; hints use `--muted`.
- Terminal output lines use `white-space: pre-wrap`; block cursor is `--ph` background with blink animation.
- Text selection is `--accent` background with `--bg` color.

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
