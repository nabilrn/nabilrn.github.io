export type IsometricCharacter = keyof typeof GLYPH_PATTERNS;

export interface Point {
  x: number;
  y: number;
}

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

export const GLYPH_PATTERNS = {
  A: ['01110','11011','10001','11111','10001','10001','10001'],
  B: ['11110','10011','10001','11110','10011','10001','11110'],
  C: ['01111','11000','10000','10000','10000','11000','01111'],
  D: ['11110','10011','10001','10001','10001','10011','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01111','11000','10000','10111','10001','11001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  J: ['00111','00010','00010','00010','10010','11010','01100'],
  K: ['10011','10110','11100','11000','11100','10110','10011'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','11111','10101','10001','10001','10001'],
  N: ['10001','11001','11101','10111','10011','10001','10001'],
  O: ['01110','11011','10001','10001','10001','11011','01110'],
  P: ['11110','10011','10001','11110','10000','10000','10000'],
  Q: ['01110','11011','10001','10001','10101','11011','01101'],
  R: ['11110','10011','10001','11110','11100','10110','10011'],
  S: ['01111','11000','11000','01110','00011','00011','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','11011','01110'],
  V: ['10001','10001','10001','10001','11011','01110','00100'],
  W: ['10001','10001','10001','10101','11111','11011','10001'],
  X: ['10001','11011','01110','00100','01110','11011','10001'],
  Y: ['10001','11011','01110','00100','00100','00100','00100'],
  Z: ['11111','00001','00011','00110','01100','11000','11111'],
} as const;

const pointKey = (point: Point) => `${point.x},${point.y}`;
const edgeKey = (a: Point, b: Point) => {
  const ka = pointKey(a);
  const kb = pointKey(b);
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
};

interface Edge { a: Point; b: Point }

function simplifyLoop(points: Point[]): Point[] {
  if (points.length < 4) return points;
  let next = points.slice();
  let changed = true;
  while (changed && next.length > 3) {
    changed = false;
    const result: Point[] = [];
    for (let index = 0; index < next.length; index++) {
      const previous = next[(index - 1 + next.length) % next.length];
      const current = next[index];
      const following = next[(index + 1) % next.length];
      const ax = current.x - previous.x;
      const ay = current.y - previous.y;
      const bx = following.x - current.x;
      const by = following.y - current.y;
      if (Math.abs(ax * by - ay * bx) < 1e-9) {
        changed = true;
        continue;
      }
      result.push(current);
    }
    next = result;
  }
  return next;
}

export function patternToContours(pattern: readonly string[]): Point[][] {
  const edges = new Map<string, Edge>();
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x] !== '1') continue;
      const p0 = { x, y };
      const p1 = { x: x + 1, y };
      const p2 = { x: x + 1, y: y + 1 };
      const p3 = { x, y: y + 1 };
      const cellEdges: Edge[] = [
        { a: p0, b: p1 },
        { a: p1, b: p2 },
        { a: p2, b: p3 },
        { a: p3, b: p0 },
      ];
      for (const edge of cellEdges) {
        const key = edgeKey(edge.a, edge.b);
        if (edges.has(key)) edges.delete(key);
        else edges.set(key, edge);
      }
    }
  }

  const boundary = [...edges.values()];
  const byStart = new Map<string, number[]>();
  boundary.forEach((edge, index) => {
    const key = pointKey(edge.a);
    const list = byStart.get(key) ?? [];
    list.push(index);
    byStart.set(key, list);
  });

  const unused = new Set(boundary.map((_, index) => index));
  const loops: Point[][] = [];

  while (unused.size) {
    const firstIndex = unused.values().next().value as number;
    const first = boundary[firstIndex];
    unused.delete(firstIndex);
    const loop: Point[] = [first.a];
    let current = first.b;
    const startKey = pointKey(first.a);
    let guard = 0;

    while (pointKey(current) !== startKey && guard++ < boundary.length + 4) {
      loop.push(current);
      const candidates = (byStart.get(pointKey(current)) ?? []).filter((index) => unused.has(index));
      if (!candidates.length) break;
      const nextIndex = candidates[0];
      unused.delete(nextIndex);
      current = boundary[nextIndex].b;
    }

    if (loop.length >= 3) loops.push(simplifyLoop(loop));
  }

  return loops;
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
  const step = Math.max(12, Math.min(42, options.step ?? 25));
  const isoX = step * Math.cos(Math.PI / 6);
  const isoY = step * Math.sin(Math.PI / 6);
  const padding = 34;
  const contours = patternToContours(GLYPH_PATTERNS[character]);

  const raw = contours.map((contour) => contour.map((point) => ({
    x: (point.x + point.y) * isoX,
    y: (point.y - point.x) * isoY,
  })));

  const allRaw = raw.flat();
  const minX = Math.min(...allRaw.map((point) => point.x));
  const maxX = Math.max(...allRaw.map((point) => point.x));
  const minY = Math.min(...allRaw.map((point) => point.y));
  const maxY = Math.max(...allRaw.map((point) => point.y));
  const offset = { x: padding - minX, y: padding - minY };
  const projected = raw.map((contour) => contour.map((point) => ({
    x: point.x + offset.x,
    y: point.y + offset.y,
  })));

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + depth + padding * 2;
  const topPath = projected.map(polygonPath).join(' ');
  const walls: string[] = [];
  const bottomChunks: string[] = [];
  const connectorChunks: string[] = [];
  const connectorKeys = new Set<string>();

  for (const contour of projected) {
    const area = signedArea(contour);
    for (let index = 0; index < contour.length; index++) {
      const a = contour[index];
      const b = contour[(index + 1) % contour.length];
      const dx = b.x - a.x;
      const outwardY = area >= 0 ? -dx : dx;
      if (outwardY <= 1e-6) continue;
      const aBottom = shiftPoint(a, depth);
      const bBottom = shiftPoint(b, depth);
      walls.push(`M ${move(a)} L ${move(b)} L ${move(bBottom)} L ${move(aBottom)} Z`);
      bottomChunks.push(linePath(aBottom, bBottom));
      for (const point of [a, b]) {
        const key = pointKey(point);
        if (connectorKeys.has(key)) continue;
        connectorKeys.add(key);
        connectorChunks.push(linePath(point, shiftPoint(point, depth)));
      }
    }
  }

  const topPoints = projected.flat();
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

const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
  ${showGuides ? geometry.guidePaths.map((path) => `<path d="${path}" fill="none" stroke="${guide}" stroke-width="1" />`).join('\n  ') : ''}
  ${geometry.walls.map((path) => `<path d="${path}" fill="${bg}" stroke="${stroke}" stroke-width="1" stroke-linejoin="miter" />`).join('\n  ')}
  <path d="${geometry.bottomPath}" fill="none" stroke="${stroke}" stroke-width="1" />
  <path d="${geometry.connectorPath}" fill="none" stroke="${stroke}" stroke-width="1" />
  <path d="${geometry.topPath}" fill="${bg}" fill-rule="evenodd" />
  ${showHatch ? `<path d="${geometry.topPath}" fill="url(#${patternId})" fill-rule="evenodd" />` : ''}
  <path d="${geometry.topPath}" fill="none" fill-rule="evenodd" stroke="${stroke}" stroke-width="1" stroke-linejoin="miter" />
</svg>`;
}
