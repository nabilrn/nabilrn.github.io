---
name: technical-isometric-nr
description: Use for the NR hero mark: isometric geometry, visible 3D edges, hatch, ruler lines, cursor spotlight, and press interaction.
---

# NR technical isometric

Reference rendering discipline: `ncdai/chanhdai.com` isometric mark. Keep the NR letterforms original.

## Projection

Author a normal flat `NR` wordmark first, then project both glyphs through one 30° lattice:

```text
screenX = originX + (x + y) * cos(30°) * step
screenY = originY + (y - x) * sin(30°) * step
```

Flat `+X` becomes screen upper-right (`-30°`); flat `+Y` becomes screen lower-right (`+30°`). N comes before R on flat X.

## Geometry

- Build N and R from simple modular polygons with consistent bar thickness.
- Keep the two glyphs as separate masses with deliberate negative space.
- Use restrained depth; the mark should read as relief, not a heavy extrusion.
- Avoid sweep stacks, duplicate lower glyphs, arbitrary connector lists, or overlapping glyphs.
- Keep the mark large inside its viewBox.

## Visible-edge rendering

Render only geometry a viewer can see from the chosen side.

1. Viewer-facing wall polygons, filled with background.
2. Exposed bottom edges and visible vertical creases.
3. Opaque top faces.
4. Hatch on top faces.
5. Top structural contour.
6. Spotlight copy of the same visible strokes.

Rules:

- A vertical crease is visible when at least one incident side face is viewer-facing.
- Keep the crease where two visible faces meet at a hard corner.
- Inner counters reverse the outer-face facing rule.
- Draw depth linework before top faces so the top fill naturally hides impossible lines.
- If a concave edge still reads incorrectly, remove that edge explicitly; do not patch with CSS opacity selectors.

## Stroke and hatch

- Structural stroke: about `1px`, `butt` caps, `miter` joins, roughly `16%` foreground mixed into background.
- Hatch: one global `userSpaceOnUse` pattern, roughly `12%` foreground; use the ChanhDai `10 x 10 / 1px` density as the baseline.
- Do not create separate loud gray systems for top, bottom, and connectors.
- Let the cursor spotlight provide the brightest hierarchy.

## Ruler lines

- Rulers are extensions of real lattice edges, never generic decoration.
- Anchor them to actual NR structural vertices and extend only along `±30°` axes.
- Draw them before walls/top faces so the solid masks them.
- Prefer one `-30°` rail and at most two `+30°` rails.
- At least one ruler intersection should coincide with a real structural vertex.
- Keep them very low contrast and remove any ruler that adds noise.

## Interaction

Press state:

- bottom footprint stays fixed;
- top moves toward the bottom;
- wall polygons and vertical connectors compress with it;
- exposed bottom edges stay fixed.

Cursor spotlight:

- fine pointers only;
- map pointer position into SVG coordinates;
- smooth the radial-gradient center;
- respect `prefers-reduced-motion`.

## Workflow

Use `src/pages/dev/nrn-compare.astro` for side-by-side validation against the reference. Iterate in `src/components/dev/NRModularMark.astro`, then promote to `src/components/home/NRMark.astro` only after the candidate is cleaner.

Before completion verify: NR reads clearly, orientation is N lower-left to R upper-right, all visible vertical creases exist, hidden depth lines do not leak through top faces, rulers pass through real vertices, hatch phase is continuous, the mark fills the viewBox confidently, and `pnpm build` passes.
