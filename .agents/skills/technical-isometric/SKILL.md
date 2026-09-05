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

`plan-view glyphs -> visible wall polygons -> top faces -> hatch -> curated structural stroke -> spotlight`

Avoid:

`font outline -> dozens of depth slices -> duplicated contours -> connector soup -> multiple competing gray strokes`

## Geometry

- Use one 30° isometric lattice for both glyphs.
- Define letters in plan-view coordinates first, then project them.
- Current hero direction is `NR`, not `NRN`: N represents Nabil, R represents Rizki.
- Treat N and R as two independent geometric masses with deliberate negative space between them.
- Do not overlap the two top surfaces merely to make the mark compact.
- Compose N lower-left and R upper-right along the projected -30° lattice axis.
- Keep glyph stroke/bar thickness visually consistent.
- Keep the R modular/angular unless a curve is necessary for recognition.
- Use simple polygons and a small number of meaningful control points.
- Depth should read as restrained relief, not a heavy extrusion. A useful target is about half the structural bar thickness.
- Keep normal and pressed states on the same lattice.

## Occlusion and hidden-line removal

Walls and visible strokes are separate concerns. Treat visibility as a design-engineering problem, not as a styling problem.

- Wall polygons may be generated from face orientation and filled with the background color.
- Do not stroke every wall edge.
- Split structural stroke into two groups:
  1. front-most top-face boundaries;
  2. depth silhouette: exposed bottom edges and real visibility-transition connectors.
- The depth stroke must be geometrically occluded by front-most top faces. An SVG mask that subtracts top-face coverage from depth stroke is valid.
- A depth edge that falls behind a top face must disappear even if it mathematically belongs to the extrusion.
- Adjacent visible wall faces do not need a vertical seam between them.
- Add a vertical depth connector only at a silhouette/visibility transition, not at every wall endpoint.
- Inner counters use the opposite-facing visibility rule from outer contours.
- If an edge still reads as an internal seam after masking, remove it from the visible-edge set; do not rescue it with opacity tricks.
- Top outlines remain clean and continuous unless a real front-to-front occlusion requires interruption.
- Never render a complete translated copy of the glyph as a visible bottom outline.

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
- Keep hatch sparse and regular.
- Hatch belongs only to top faces.
- Do not procedurally emit hundreds of lines when a single SVG pattern expresses the same system.

## Technical ruler lines

Ruler lines are lattice extensions, not decoration.

- Anchor each ruler to an actual structural vertex of the mark.
- Extend exactly along a ±30° lattice axis.
- Draw rulers before wall/top fills so solid geometry naturally masks them.
- Prefer the minimum useful set: typically one baseline-family line and up to two lines from the opposite lattice family.
- Parallel rulers should share the same lattice family.
- Use a very low-contrast border/background-derived color and a short dash pattern.
- Remove a ruler if it adds noise without clarifying the construction system.

## Press interaction

Treat the press as a controlled 3D illusion.

- Keep the bottom footprint fixed.
- Move the top surface toward the bottom.
- Morph visible wall polygons so depth compresses.
- Morph both top and depth structural strokes to match the new top position.
- Move the top-face occlusion mask with the top face so hidden-line removal remains correct during the press.
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
3. Inspect silhouette, spacing, topology, hatch phase, hidden seams, ruler placement, base contrast, cursor glow, and press-state occlusion.
4. Promote the NR implementation only after the candidate is visually cleaner than the existing production mark.

## Anti-patterns

Do not:

- generate 20+ sweep/depth copies of the glyph;
- add connectors at every polygon vertex;
- render a full lower glyph outline underneath the top face;
- overlap N and R until they read as one tangled solid;
- use arbitrary diagonal background lines unrelated to actual vertices;
- use thick high-contrast outlines to explain weak geometry;
- rely on rounded joins to hide imprecise intersections;
- patch visibility with fragile `nth-child`/opacity hacks;
- copy the ChanhDai C/D geometry into NR.

## QA

Before calling the mark done:

- NR is recognizable without labels.
- N and R share one projection and hatch phase.
- The two masses remain visually separate with intentional negative space.
- Overall letter flow is lower-left -> upper-right.
- No bottom/depth stroke is visible through a front-most top face.
- No internal seam looks like an accidental leftover stroke.
- Ruler lines pass through real structural vertices.
- Walls mask rulers naturally.
- Base stroke is quiet; cursor highlight provides the brightest edge.
- Press state compresses depth without shifting the bottom footprint or breaking the occlusion mask.
- Fine-pointer, coarse-pointer, keyboard, and reduced-motion behavior remain valid.
- `pnpm build` passes.
