---
name: technical-isometric-nr
description: Use when designing or editing the NR hero mark, modular lettering, isometric geometry, 3D side walls, hatch, technical ruler lines, structural stroke visibility, cursor spotlight, or pressed-depth interaction.
---

# NR Technical Isometric Skill

## Purpose

Build the NR monogram as clean technical line-art with modular geometry. The visual grammar is informed by the ChanhDai isometric mark, but the N/R letterforms remain original.

Reference implementation studied:
`https://github.com/ncdai/chanhdai.com/blob/main/src/features/portfolio/components/chanhdai-mark-isometric.tsx`

Brand geometry reference studied:
`https://github.com/ncdai/chanhdai.com/blob/main/src/features/doc/content/blog/chanhdai-brand.mdx`

Use the reference for rendering discipline, not for copying C/D letterforms.

## Core principle

Prefer a small number of intentional geometric primitives over a physically complete 3D renderer.

Good:

`plan-view glyphs -> visible wall polygons -> exposed depth linework -> top faces -> hatch -> top structural stroke -> spotlight`

Avoid:

`font outline -> dozens of depth slices -> duplicated contours -> connector soup -> multiple competing gray strokes`

## Canonical isometric basis

Use one 30° isometric lattice for both glyphs.

The canonical flat-to-screen basis is:

- flat `+X` (letter left -> right) projects to screen upper-right at `-30°`;
- flat `+Y` (letter top -> bottom) projects to screen lower-right at `+30°`.

Equivalent projection:

`screenX = originX + (x + y) * cos(30°) * step`

`screenY = originY + (y - x) * sin(30°) * step`

Do not swap back to `(x - y, x + y)` because that rotates the actual letterforms even if the two glyphs still happen to form a diagonal composition.

## Geometry

- Define letters in flat plan-view coordinates first, exactly like an ordinary `NR` wordmark.
- Current hero direction is `NR`, not `NRN`: N represents Nabil, R represents Rizki.
- N comes first on flat X; R is translated positively on flat X.
- This naturally places N lower-left and R upper-right after isometric projection while keeping both letters upright.
- Treat N and R as two independent geometric masses with deliberate negative space between them.
- Do not overlap the two top surfaces merely to make the mark compact.
- Keep glyph stroke/bar thickness visually consistent.
- Keep the R modular/angular unless a curve is necessary for recognition.
- Use simple polygons and a small number of meaningful control points.
- Depth should read as restrained relief, not a heavy extrusion.
- Keep normal and pressed states on the same lattice.
- The mark should occupy most of its SVG viewBox; avoid a small monogram floating inside a much larger empty component.

## Occlusion and visible-edge engineering

Walls and visible strokes are separate concerns. Treat visibility as a design-engineering problem, not as a styling problem.

- Generate only viewer-facing side-wall polygons and fill them with the background color.
- Top-face boundaries are always front-most and should be drawn as one quiet structural contour.
- Exposed bottom edges belong only to viewer-facing wall faces.
- A vertical extrusion edge is visible whenever at least one of its incident side faces is viewer-facing.
- If two viewer-facing side faces meet at a sharp corner, their shared vertical crease is a real visible edge and should normally remain visible. Do not remove it merely because both adjacent faces are visible.
- Inner counters reverse the outer-face orientation rule.
- Keep bottom edges and vertical connectors separate from the top contour.
- Prefer painter-order occlusion: draw exposed wall/depth linework before opaque top faces, then draw the top contour after the top faces. The top fill naturally hides any depth segment that sits physically behind it.
- Never render a complete translated lower copy of the entire glyph.
- If a specific concave edge still reads as impossible after painter-order occlusion, remove that edge from the visible set explicitly; do not use fragile CSS opacity patches.

## Stroke and color hierarchy

Use one structural stroke language.

- Structural base stroke: about `1px` and roughly `16%` foreground mixed into background.
- Hatch: roughly `12%` foreground mixed into background.
- Use `butt` caps and `miter` joins for engineering geometry.
- Avoid separate top/bottom/connector gray systems unless there is a specific visual reason.
- Render the same visible structural geometry a second time with a radial-gradient spotlight.
- Let the moving spotlight create hierarchy; do not make the base outline loud.

## Hatch

- Use one global `userSpaceOnUse` pattern so phase is shared across N -> R.
- The ChanhDai reference uses a `10 x 10` pattern with a `1px` diagonal line in a `556`-wide viewBox; use that as the normalized density baseline.
- If the NR surface looks sparse, first fix glyph scale/viewBox occupancy before inventing a much denser pattern.
- Hatch belongs only to top faces.
- Do not procedurally emit hundreds of lines when a single SVG pattern expresses the same system.

## Technical ruler lines

Ruler lines are lattice extensions, not decoration.

- Anchor each ruler to an actual structural vertex of the mark.
- Extend exactly along a ±30° lattice axis.
- Draw rulers before wall/top fills so solid geometry naturally masks them.
- The main `-30°` ruler should run through a lower construction row / bottom structural vertex, like the reference, not hover above the monogram.
- Prefer one `-30°` rail and up to two `+30°` rails passing through real bottom or exposed vertices.
- At least one pair of rails should intersect at a real structural vertex so the line system reads as part of the object construction.
- Use a very low-contrast border/background-derived color and a short dash pattern.
- Remove a ruler if it adds noise without clarifying the construction system.

## Press interaction

Treat the press as a controlled 3D illusion.

- Keep the bottom footprint fixed.
- Move the top surface toward the bottom.
- Morph visible wall polygons so depth compresses.
- Morph vertical connector strokes so their top endpoints follow the pressed top face.
- Exposed bottom edges remain fixed.
- Do not move the entire solid as one block.
- Respect `prefers-reduced-motion`.

## Cursor spotlight

- Track pointer position only for fine pointers.
- Map pointer coordinates into SVG space.
- Smooth the gradient center with spring/easing behavior.
- The spotlight overlays the same visible structural paths as the base stroke.
- The base drawing must remain understandable without the spotlight.

## Development workflow

Use `src/pages/dev/nrn-compare.astro` as the visual lab.

1. Keep the ChanhDai reference intact for side-by-side comparison.
2. Iterate on `src/components/dev/NRModularMark.astro` without changing the production hero first.
3. Inspect silhouette, spacing, viewBox occupancy, hatch density, complete visible vertical creases, bottom-edge occlusion, ruler placement, base contrast, cursor glow, and press state.
4. Promote the NR implementation only after the candidate is visually cleaner than the existing production mark.

## Anti-patterns

Do not:

- generate 20+ sweep/depth copies of the glyph;
- remove a real visible vertical crease just because two adjacent faces are both viewer-facing;
- render a full lower glyph outline underneath the top face;
- overlap N and R until they read as one tangled solid;
- use arbitrary diagonal background lines unrelated to actual vertices;
- place the main ruler above the object instead of on a structural construction row;
- use thick high-contrast outlines to explain weak geometry;
- rely on rounded joins to hide imprecise intersections;
- patch visibility with fragile `nth-child`/opacity hacks;
- copy the ChanhDai C/D geometry into NR.

## QA

Before calling the mark done:

- NR is recognizable without labels.
- N and R share one projection and hatch phase.
- The two masses remain visually separate with intentional negative space.
- Flat NR order projects naturally to lower-left N -> upper-right R.
- The mark occupies the viewBox confidently instead of floating small inside it.
- Every vertical crease visible from the chosen side is present.
- No impossible bottom/depth stroke shows through a front-most top face.
- No internal seam looks like an accidental leftover stroke.
- Ruler lines pass through real structural vertices and read inline with the mark.
- Walls mask rulers naturally.
- Base stroke is quiet; cursor highlight provides the brightest edge.
- Press state compresses depth without shifting the bottom footprint.
- Fine-pointer, coarse-pointer, keyboard, and reduced-motion behavior remain valid.
- `pnpm build` passes.
