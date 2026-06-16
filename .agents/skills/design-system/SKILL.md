---
name: design-system-nabilrn-nabil-github
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# nabilrn (Nabil) · GitHub

## Mission
Deliver implementation-ready design-system guidance for nabilrn (Nabil) · GitHub that can be applied consistently across marketing site interfaces.

## Brand
- Product/brand: nabilrn (Nabil) · GitHub
- URL: https://github.com/nabilrn
- Audience: developers and technical teams
- Product surface: marketing site

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=Mona Sans VF`, `font.family.stack=Mona Sans VF, -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=21px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=17.5px`, `font.size.xl=20px`, `font.size.2xl=24px`, `font.size.3xl=28px`, `font.size.4xl=32px`
- Color palette: `color.text.primary=#f0f6fc`, `color.text.secondary=#4493f8`, `color.text.tertiary=#9198a1`, `color.text.inverse=#ffffff`, `color.surface.base=#000000`, `color.surface.muted=#151b23`, `color.surface.raised=#033a16`, `color.surface.strong=#1f6feb`, `color.border.strong=#010409`
- Spacing scale: `space.1=1.5px`, `space.2=3.5px`, `space.3=4px`, `space.4=5px`, `space.5=6px`, `space.6=8px`, `space.7=8.4px`, `space.8=12px`
- Radius/shadow/motion tokens: `radius.xs=2px`, `radius.sm=6px` | `motion.duration.instant=80ms`, `motion.duration.fast=200ms`, `motion.duration.normal=500ms`

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
