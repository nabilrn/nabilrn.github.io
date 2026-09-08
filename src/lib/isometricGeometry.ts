export interface Point {
  x: number;
  y: number;
}

type GlyphContour = {
  points: readonly Point[];
  hole?: boolean;
};

type GlyphDefinition = {
  contours: readonly GlyphContour[];
};

const contour = (points: readonly Point[], hole = false): GlyphContour => ({ points, hole });

export const GLYPH_DEFINITIONS = {
  A: { contours: [
    contour([{ x: 0, y: 7 }, { x: .85, y: 1.7 }, { x: 1.8, y: 0 }, { x: 3.2, y: 0 }, { x: 4.15, y: 1.7 }, { x: 5, y: 7 }, { x: 3.55, y: 7 }, { x: 3.25, y: 5 }, { x: 1.75, y: 5 }, { x: 1.45, y: 7 }]),
    contour([{ x: 1.95, y: 3.65 }, { x: 2.15, y: 2.25 }, { x: 2.35, y: 1.55 }, { x: 2.65, y: 1.55 }, { x: 2.85, y: 2.25 }, { x: 3.05, y: 3.65 }], true),
  ] },
  B: { contours: [
    contour([{ x: 0, y: 0 }, { x: 3.55, y: 0 }, { x: 5, y: 1.15 }, { x: 5, y: 2.65 }, { x: 4.15, y: 3.45 }, { x: 5, y: 4.3 }, { x: 5, y: 5.85 }, { x: 3.6, y: 7 }, { x: 0, y: 7 }]),
    contour([{ x: 1.4, y: 1.3 }, { x: 3.15, y: 1.3 }, { x: 3.6, y: 1.65 }, { x: 3.6, y: 2.25 }, { x: 3.15, y: 2.65 }, { x: 1.4, y: 2.65 }], true),
    contour([{ x: 1.4, y: 4.2 }, { x: 3.1, y: 4.2 }, { x: 3.6, y: 4.6 }, { x: 3.6, y: 5.35 }, { x: 3.1, y: 5.7 }, { x: 1.4, y: 5.7 }], true),
  ] },
  C: { contours: [contour([{ x: 5, y: 0 }, { x: 1.35, y: 0 }, { x: 0, y: 1.35 }, { x: 0, y: 5.65 }, { x: 1.35, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 5.55 }, { x: 1.85, y: 5.55 }, { x: 1.4, y: 5.1 }, { x: 1.4, y: 1.9 }, { x: 1.85, y: 1.45 }, { x: 5, y: 1.45 }])] },
  D: { contours: [
    contour([{ x: 0, y: 0 }, { x: 3.4, y: 0 }, { x: 5, y: 1.45 }, { x: 5, y: 5.55 }, { x: 3.4, y: 7 }, { x: 0, y: 7 }]),
    contour([{ x: 1.4, y: 1.4 }, { x: 2.95, y: 1.4 }, { x: 3.6, y: 2 }, { x: 3.6, y: 5 }, { x: 2.95, y: 5.6 }, { x: 1.4, y: 5.6 }], true),
  ] },
  E: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.35 }, { x: 1.4, y: 1.35 }, { x: 1.4, y: 2.8 }, { x: 4.25, y: 2.8 }, { x: 4.25, y: 4.15 }, { x: 1.4, y: 4.15 }, { x: 1.4, y: 5.65 }, { x: 5, y: 5.65 }, { x: 5, y: 7 }, { x: 0, y: 7 }])] },
  F: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.35 }, { x: 1.4, y: 1.35 }, { x: 1.4, y: 2.9 }, { x: 4.25, y: 2.9 }, { x: 4.25, y: 4.25 }, { x: 1.4, y: 4.25 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }])] },
  G: { contours: [contour([{ x: 5, y: 0 }, { x: 1.35, y: 0 }, { x: 0, y: 1.35 }, { x: 0, y: 5.65 }, { x: 1.35, y: 7 }, { x: 5, y: 7 }, { x: 5, y: 3.65 }, { x: 3, y: 3.65 }, { x: 3, y: 5 }, { x: 3.6, y: 5 }, { x: 3.6, y: 5.55 }, { x: 1.85, y: 5.55 }, { x: 1.4, y: 5.1 }, { x: 1.4, y: 1.9 }, { x: 1.85, y: 1.45 }, { x: 5, y: 1.45 }])] },
  H: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 1.4, y: 2.8 }, { x: 3.6, y: 2.8 }, { x: 3.6, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 7 }, { x: 3.6, y: 7 }, { x: 3.6, y: 4.2 }, { x: 1.4, y: 4.2 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }])] },
  I: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.35 }, { x: 3.2, y: 1.35 }, { x: 3.2, y: 5.65 }, { x: 5, y: 5.65 }, { x: 5, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 5.65 }, { x: 1.8, y: 5.65 }, { x: 1.8, y: 1.35 }, { x: 0, y: 1.35 }])] },
  J: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5.6 }, { x: 3.6, y: 7 }, { x: 1.25, y: 7 }, { x: 0, y: 5.75 }, { x: 0, y: 4.55 }, { x: 1.4, y: 4.55 }, { x: 1.4, y: 5.15 }, { x: 1.85, y: 5.6 }, { x: 3.15, y: 5.6 }, { x: 3.6, y: 5.15 }, { x: 3.6, y: 1.4 }, { x: 0, y: 1.4 }])] },
  K: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 1.4, y: 2.7 }, { x: 3.65, y: 0 }, { x: 5, y: 0 }, { x: 2.35, y: 3.4 }, { x: 5, y: 7 }, { x: 3.3, y: 7 }, { x: 1.4, y: 4.35 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }])] },
  L: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 1.4, y: 5.6 }, { x: 5, y: 5.6 }, { x: 5, y: 7 }, { x: 0, y: 7 }])] },
  M: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 2.5, y: 2.35 }, { x: 3.6, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 7 }, { x: 3.6, y: 7 }, { x: 3.6, y: 2.55 }, { x: 2.5, y: 4.65 }, { x: 1.4, y: 2.55 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }])] },
  N: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 3.6, y: 4.9 }, { x: 3.6, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 7 }, { x: 3.6, y: 7 }, { x: 1.4, y: 2.1 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }])] },
  O: { contours: [
    contour([{ x: 1.25, y: 0 }, { x: 3.75, y: 0 }, { x: 5, y: 1.25 }, { x: 5, y: 5.75 }, { x: 3.75, y: 7 }, { x: 1.25, y: 7 }, { x: 0, y: 5.75 }, { x: 0, y: 1.25 }]),
    contour([{ x: 1.4, y: 1.75 }, { x: 1.85, y: 1.4 }, { x: 3.15, y: 1.4 }, { x: 3.6, y: 1.75 }, { x: 3.6, y: 5.25 }, { x: 3.15, y: 5.6 }, { x: 1.85, y: 5.6 }, { x: 1.4, y: 5.25 }], true),
  ] },
  P: { contours: [
    contour([{ x: 0, y: 0 }, { x: 3.6, y: 0 }, { x: 5, y: 1.3 }, { x: 5, y: 3.3 }, { x: 3.6, y: 4.55 }, { x: 1.4, y: 4.55 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }]),
    contour([{ x: 1.4, y: 1.35 }, { x: 3.1, y: 1.35 }, { x: 3.6, y: 1.8 }, { x: 3.6, y: 2.75 }, { x: 3.1, y: 3.2 }, { x: 1.4, y: 3.2 }], true),
  ] },
  Q: { contours: [
    contour([{ x: 1.25, y: 0 }, { x: 3.75, y: 0 }, { x: 5, y: 1.25 }, { x: 5, y: 5 }, { x: 4.55, y: 5.55 }, { x: 5.5, y: 7 }, { x: 3.9, y: 7 }, { x: 3.35, y: 6.2 }, { x: 1.25, y: 6.2 }, { x: 0, y: 5 }, { x: 0, y: 1.25 }]),
    contour([{ x: 1.4, y: 1.75 }, { x: 1.85, y: 1.4 }, { x: 3.15, y: 1.4 }, { x: 3.6, y: 1.75 }, { x: 3.6, y: 4.55 }, { x: 3.15, y: 4.9 }, { x: 1.85, y: 4.9 }, { x: 1.4, y: 4.55 }], true),
  ] },
  R: { contours: [
    contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 4, y: 0 }, { x: 5.2, y: 1.2 }, { x: 5.2, y: 3.4 }, { x: 4.2, y: 4.4 }, { x: 3.1, y: 4.4 }, { x: 5.2, y: 7 }, { x: 3.4, y: 7 }, { x: 1.4, y: 4.5 }, { x: 1.4, y: 7 }, { x: 0, y: 7 }]),
    contour([{ x: 1.4, y: 1.2 }, { x: 3.7, y: 1.2 }, { x: 4, y: 1.5 }, { x: 4, y: 2.8 }, { x: 3.7, y: 3.1 }, { x: 1.4, y: 3.1 }], true),
  ] },
  S: { contours: [contour([{ x: .8, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.4 }, { x: 1.55, y: 1.4 }, { x: 1.4, y: 1.58 }, { x: 1.4, y: 2.35 }, { x: 1.58, y: 2.55 }, { x: 4.05, y: 2.55 }, { x: 5, y: 3.5 }, { x: 5, y: 5.6 }, { x: 3.6, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 5.6 }, { x: 3.35, y: 5.6 }, { x: 3.6, y: 5.35 }, { x: 3.6, y: 4.45 }, { x: 3.35, y: 4.2 }, { x: .95, y: 4.2 }, { x: 0, y: 3.25 }, { x: 0, y: 1.2 }])] },
  T: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.4 }, { x: 3.2, y: 1.4 }, { x: 3.2, y: 7 }, { x: 1.8, y: 7 }, { x: 1.8, y: 1.4 }, { x: 0, y: 1.4 }])] },
  U: { contours: [contour([{ x: 0, y: 0 }, { x: 1.4, y: 0 }, { x: 1.4, y: 5.1 }, { x: 1.85, y: 5.6 }, { x: 3.15, y: 5.6 }, { x: 3.6, y: 5.1 }, { x: 3.6, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5.65 }, { x: 3.65, y: 7 }, { x: 1.35, y: 7 }, { x: 0, y: 5.65 }])] },
  V: { contours: [contour([{ x: 0, y: 0 }, { x: 1.5, y: 0 }, { x: 2.5, y: 5.25 }, { x: 3.5, y: 0 }, { x: 5, y: 0 }, { x: 3.4, y: 7 }, { x: 1.6, y: 7 }])] },
  W: { contours: [contour([{ x: 0, y: 0 }, { x: 1.35, y: 0 }, { x: 1.7, y: 4.95 }, { x: 2.5, y: 2.9 }, { x: 3.3, y: 4.95 }, { x: 3.65, y: 0 }, { x: 5, y: 0 }, { x: 4.4, y: 7 }, { x: 3.2, y: 7 }, { x: 2.5, y: 5.15 }, { x: 1.8, y: 7 }, { x: .6, y: 7 }])] },
  X: { contours: [contour([{ x: 0, y: 0 }, { x: 1.6, y: 0 }, { x: 2.5, y: 2.3 }, { x: 3.4, y: 0 }, { x: 5, y: 0 }, { x: 3.3, y: 3.5 }, { x: 5, y: 7 }, { x: 3.4, y: 7 }, { x: 2.5, y: 4.7 }, { x: 1.6, y: 7 }, { x: 0, y: 7 }, { x: 1.7, y: 3.5 }])] },
  Y: { contours: [contour([{ x: 0, y: 0 }, { x: 1.5, y: 0 }, { x: 2.5, y: 2.65 }, { x: 3.5, y: 0 }, { x: 5, y: 0 }, { x: 3.2, y: 4.1 }, { x: 3.2, y: 7 }, { x: 1.8, y: 7 }, { x: 1.8, y: 4.1 }])] },
  Z: { contours: [contour([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 1.4 }, { x: 1.9, y: 5.6 }, { x: 5, y: 5.6 }, { x: 5, y: 7 }, { x: 0, y: 7 }, { x: 0, y: 5.6 }, { x: 3.1, y: 1.4 }, { x: 0, y: 1.4 }])] },
} as const satisfies Record<string, GlyphDefinition>;

export type IsometricCharacter = keyof typeof GLYPH_DEFINITIONS;

export interface IsometricOptions {
  character: IsometricCharacter;
  depth?: number;
  hatch?: boolean;
  guides?: boolean;
  step?: number;
}

export interface IsometricGeometry {
  character: IsometricCharacter;
  depth: number;
  viewBox: string;
  width: number;
  height: number;
  topPath: string;
  walls: string[];
  bottomPath: string;
  connectorPath: string;
  guidePaths: string[];
}

const signedArea = (points: Point[]) => points.reduce((sum, point, index) => {
  const next = points[(index + 1) % points.length];
  return sum + point.x * next.y - next.x * point.y;
}, 0) / 2;

const move = (point: Point) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
const polygonPath = (points: Point[]) => {
  const [first, ...rest] = points;
  return `M ${move(first)} ${rest.map((point) => `L ${move(point)}`).join(' ')} Z`;
};
const shiftPoint = (point: Point, dy: number): Point => ({ x: point.x, y: point.y + dy });
const linePath = (a: Point, b: Point) => `M ${move(a)} L ${move(b)}`;

export function buildIsometricGeometry(options: IsometricOptions): IsometricGeometry {
  const character = options.character;
  const depth = Math.max(6, Math.min(72, options.depth ?? 28));
  const step = Math.max(12, Math.min(42, options.step ?? 26));
  const isoX = step * Math.cos(Math.PI / 6);
  const isoY = step * Math.sin(Math.PI / 6);
  const xScale = 1.1;
  const padding = 36;
  const definition = GLYPH_DEFINITIONS[character];

  const raw = definition.contours.map((entry) => ({
    hole: Boolean(entry.hole),
    points: entry.points.map((point) => ({
      x: (point.x * xScale + point.y) * isoX,
      y: (point.y - point.x * xScale) * isoY,
    })),
  }));

  const allRaw = raw.flatMap((entry) => entry.points);
  const minX = Math.min(...allRaw.map((point) => point.x));
  const maxX = Math.max(...allRaw.map((point) => point.x));
  const minY = Math.min(...allRaw.map((point) => point.y));
  const maxY = Math.max(...allRaw.map((point) => point.y));
  const offset = { x: padding - minX, y: padding - minY };
  const projected = raw.map((entry) => ({
    hole: entry.hole,
    points: entry.points.map((point) => ({ x: point.x + offset.x, y: point.y + offset.y })),
  }));

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + depth + padding * 2;
  const topPath = projected.map((entry) => polygonPath(entry.points)).join(' ');
  const walls: string[] = [];
  const bottomChunks: string[] = [];
  const connectorChunks: string[] = [];
  const connectorKeys = new Set<string>();

  for (const entry of projected) {
    const area = signedArea(entry.points);
    for (let index = 0; index < entry.points.length; index++) {
      const a = entry.points[index];
      const b = entry.points[(index + 1) % entry.points.length];
      const dx = b.x - a.x;
      const baseVisibility = area >= 0 ? -dx : dx;
      const visibleDirection = entry.hole ? -baseVisibility : baseVisibility;
      if (visibleDirection <= 1e-6) continue;

      const aBottom = shiftPoint(a, depth);
      const bBottom = shiftPoint(b, depth);
      walls.push(`M ${move(a)} L ${move(b)} L ${move(bBottom)} L ${move(aBottom)} Z`);
      bottomChunks.push(linePath(aBottom, bBottom));

      for (const point of [a, b]) {
        const key = `${point.x.toFixed(3)}:${point.y.toFixed(3)}`;
        if (connectorKeys.has(key)) continue;
        connectorKeys.add(key);
        connectorChunks.push(linePath(point, shiftPoint(point, depth)));
      }
    }
  }

  const topPoints = projected.flatMap((entry) => entry.points);
  const highest = topPoints.reduce((best, point) => point.y < best.y ? point : best);
  const lowest = topPoints.reduce((best, point) => point.y > best.y ? point : best);
  const leftmost = topPoints.reduce((best, point) => point.x < best.x ? point : best);
  const axisPos = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
  const axisNeg = { x: Math.cos(Math.PI / 6), y: -Math.sin(Math.PI / 6) };
  const extent = Math.max(width, height) * 1.7;
  const guideThrough = (anchor: Point, direction: Point) => linePath(
    { x: anchor.x - direction.x * extent, y: anchor.y - direction.y * extent },
    { x: anchor.x + direction.x * extent, y: anchor.y + direction.y * extent },
  );

  return {
    character,
    depth,
    viewBox: `0 0 ${width.toFixed(3)} ${height.toFixed(3)}`,
    width,
    height,
    topPath,
    walls,
    bottomPath: bottomChunks.join(' '),
    connectorPath: connectorChunks.join(' '),
    guidePaths: [
      guideThrough(highest, axisNeg),
      guideThrough(shiftPoint(lowest, depth), axisNeg),
      guideThrough(shiftPoint(leftmost, depth), axisPos),
    ],
  };
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function renderIsometricSvg(options: IsometricOptions & { themeAware?: boolean }): string {
  const geometry = buildIsometricGeometry(options);
  const themeAware = options.themeAware ?? false;
  const bg = themeAware ? 'var(--bg)' : '#0a0a0a';
  const stroke = themeAware ? 'color-mix(in srgb, var(--text) 26%, var(--bg))' : '#5a5a5a';
  const hatch = themeAware ? 'color-mix(in srgb, var(--text) 15%, var(--bg))' : '#373737';
  const guide = themeAware ? 'color-mix(in srgb, var(--text) 9%, var(--bg))' : '#242424';
  const patternId = `iso-hatch-${geometry.character.toLowerCase()}`;
  const showHatch = options.hatch ?? true;
  const showGuides = options.guides ?? true;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geometry.viewBox}" role="img" aria-label="Isometric ${escapeXml(geometry.character)}" style="display:block;width:100%;height:auto;background:${bg}">
  <defs>
    <pattern id="${patternId}" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M-2 2 L2 -2 M0 10 L10 0 M8 12 L12 8" fill="none" stroke="${hatch}" stroke-width="1" />
    </pattern>
  </defs>
  ${showGuides ? geometry.guidePaths.map((path) => `<path d="${path}" fill="none" stroke="${guide}" stroke-width="1" stroke-dasharray="4 2" />`).join('\n  ') : ''}
  ${geometry.walls.map((path) => `<path d="${path}" fill="${bg}" stroke="${stroke}" stroke-width="1" stroke-linejoin="miter" />`).join('\n  ')}
  <path d="${geometry.bottomPath}" fill="none" stroke="${stroke}" stroke-width="1" />
  <path d="${geometry.connectorPath}" fill="none" stroke="${stroke}" stroke-width="1" />
  <path d="${geometry.topPath}" fill="${bg}" fill-rule="evenodd" />
  ${showHatch ? `<path d="${geometry.topPath}" fill="url(#${patternId})" fill-rule="evenodd" />` : ''}
  <path d="${geometry.topPath}" fill="none" fill-rule="evenodd" stroke="${stroke}" stroke-width="1" stroke-linejoin="miter" />
</svg>`;
}
