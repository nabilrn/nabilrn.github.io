export type NrPoint = { x: number; y: number };
export type NrPlacement = { kind: 'n' | 'r'; ox: number; oy: number };
export type NrFillRule = 'evenodd' | 'nonzero';
type BottomSegment = { edge: number; from: number; to: number };
type Surface = {
    points: NrPoint[];
    wallVisible: boolean[];
    bottomSegments: BottomSegment[];
    connectorVisible: boolean[];
};
export type NrWall = { a: NrPoint; b: NrPoint };

const ISO_STEP = 26;
const ISO_X = ISO_STEP * Math.cos(Math.PI / 6);
const ISO_Y = ISO_STEP * Math.sin(Math.PI / 6);
const GLYPH_X_SCALE = 1.1;

export const NR_DEPTH = 28;
export const NR_VIEWBOX = { x: 125, y: 30, width: 525, height: 315 } as const;

// Keep the bottom datum stable while reclaiming the unused space above the mark.
// The glyphs are authored flat first, then projected on the same ±30° isometric axes.
const ORIGIN: NrPoint = { x: 165, y: 198 };

const PLACEMENTS: NrPlacement[] = [
    { kind: 'n', ox: 0, oy: 0 },
    { kind: 'r', ox: 6.8, oy: 0 },
];

const N_OUTER: NrPoint[] = [
    { x: 0, y: 0 },
    { x: 1.4, y: 0 },
    { x: 3.6, y: 4.9 },
    { x: 3.6, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 7 },
    { x: 3.6, y: 7 },
    { x: 1.4, y: 2.1 },
    { x: 1.4, y: 7 },
    { x: 0, y: 7 },
];

// The diagonal leg joins the stem directly; the previous micro-segment created
// a false notch after projection.
const R_OUTER: NrPoint[] = [
    { x: 0, y: 0 },
    { x: 1.4, y: 0 },
    { x: 4, y: 0 },
    { x: 5.2, y: 1.2 },
    { x: 5.2, y: 3.4 },
    { x: 4.2, y: 4.4 },
    { x: 3.1, y: 4.4 },
    { x: 5.2, y: 7 },
    { x: 3.4, y: 7 },
    { x: 1.4, y: 4.5 },
    { x: 1.4, y: 7 },
    { x: 0, y: 7 },
];

const R_HOLE: NrPoint[] = [
    { x: 1.4, y: 1.2 },
    { x: 3.7, y: 1.2 },
    { x: 4, y: 1.5 },
    { x: 4, y: 2.8 },
    { x: 3.7, y: 3.1 },
    { x: 1.4, y: 3.1 },
];

const project = (point: NrPoint, placement: NrPlacement): NrPoint => {
    const x = placement.ox + point.x * GLYPH_X_SCALE;
    const y = point.y + placement.oy;
    return {
        x: ORIGIN.x + (x + y) * ISO_X,
        y: ORIGIN.y + (y - x) * ISO_Y,
    };
};

const shifted = (point: NrPoint, dy: number): NrPoint => ({ x: point.x, y: point.y + dy });
const move = (point: NrPoint) => `${point.x.toFixed(3)} ${point.y.toFixed(3)}`;
const projected = (shape: NrPoint[], placement: NrPlacement) => shape.map((point) => project(point, placement));
const lerpPoint = (a: NrPoint, b: NrPoint, t: number): NrPoint => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
});

const polygonPath = (points: NrPoint[]) => {
    const [first, ...rest] = points;
    return `M ${move(first)} ${rest.map((point) => `L ${move(point)}`).join(' ')} Z`;
};

const glyphPath = (placement: NrPlacement) => {
    if (placement.kind === 'n') return polygonPath(projected(N_OUTER, placement));
    return `${polygonPath(projected(R_OUTER, placement))} ${polygonPath(projected(R_HOLE, placement))}`;
};

export const NR_GLYPHS = PLACEMENTS.map((placement) => ({
    placement,
    path: glyphPath(placement),
    fillRule: (placement.kind === 'r' ? 'evenodd' : 'nonzero') as NrFillRule,
}));

// This mark is fixed, so wall, lower-silhouette and connector visibility are
// authored independently. Concave lower edges can be only partially exposed,
// so bottom geometry uses clipped edge ranges instead of a simple on/off flag.
const makeSurface = (
    shape: NrPoint[],
    placement: NrPlacement,
    wallEdges: number[],
    bottomSegments: BottomSegment[],
    connectorVertices: number[],
): Surface => {
    const points = projected(shape, placement);
    const wallSet = new Set(wallEdges);
    const connectorSet = new Set(connectorVertices);
    return {
        points,
        wallVisible: points.map((_, index) => wallSet.has(index)),
        bottomSegments,
        connectorVisible: points.map((_, index) => connectorSet.has(index)),
    };
};

const fullBottomSegments = (edges: number[]): BottomSegment[] =>
    edges.map((edge) => ({ edge, from: 0, to: 1 }));

const N = PLACEMENTS[0];
const R = PLACEMENTS[1];

const SURFACES: Surface[] = [
    makeSurface(
        N_OUTER,
        N,
        [2, 5, 6, 8, 9],
        [
            { edge: 2, from: 0.665, to: 1 },
            { edge: 5, from: 0, to: 1 },
            { edge: 6, from: 0, to: 0.555 },
            { edge: 8, from: 0, to: 1 },
            { edge: 9, from: 0, to: 1 },
        ],
        [0, 3, 5, 6, 8, 9],
    ),
    makeSurface(
        R_OUTER,
        R,
        [5, 7, 8, 10, 11],
        fullBottomSegments([5, 7, 8, 10, 11]),
        [0, 5, 7, 8, 10, 11],
    ),
    makeSurface(R_HOLE, R, [0, 1, 2], fullBottomSegments([0, 1, 2]), [0, 3]),
];

export const nrWallPath = (a: NrPoint, b: NrPoint, topShift = 0) => {
    const aTop = shifted(a, topShift);
    const bTop = shifted(b, topShift);
    const bBottom = shifted(b, NR_DEPTH);
    const aBottom = shifted(a, NR_DEPTH);
    return `M ${move(aTop)} L ${move(bTop)} L ${move(bBottom)} L ${move(aBottom)} Z`;
};

export const NR_WALLS: NrWall[] = SURFACES.flatMap((surface) =>
    surface.points.flatMap((a, index) => {
        if (!surface.wallVisible[index]) return [];
        const b = surface.points[(index + 1) % surface.points.length];
        return [{ a, b }];
    }),
);

const bottomStrokePath = () => {
    const chunks: string[] = [];
    for (const surface of SURFACES) {
        for (const segment of surface.bottomSegments) {
            const a = surface.points[segment.edge];
            const b = surface.points[(segment.edge + 1) % surface.points.length];
            const start = shifted(lerpPoint(a, b, segment.from), NR_DEPTH);
            const end = shifted(lerpPoint(a, b, segment.to), NR_DEPTH);
            chunks.push(`M ${move(start)} L ${move(end)}`);
        }
    }
    return chunks.join(' ');
};

const connectorPoints = () => {
    const points: NrPoint[] = [];
    const keys = new Set<string>();

    for (const surface of SURFACES) {
        surface.points.forEach((point, index) => {
            if (!surface.connectorVisible[index]) return;
            const key = `${point.x.toFixed(3)}:${point.y.toFixed(3)}`;
            if (keys.has(key)) return;
            keys.add(key);
            points.push(point);
        });
    }

    return points;
};

export const nrConnectorPath = (point: NrPoint, topShift = 0) =>
    `M ${move(shifted(point, topShift))} L ${move(shifted(point, NR_DEPTH))}`;

export const NR_TOP_STROKE = PLACEMENTS.map((placement) => glyphPath(placement)).join(' ');
export const NR_BOTTOM_STROKE = bottomStrokePath();
export const NR_CONNECTOR_POINTS = connectorPoints();

const AXIS_POSITIVE: NrPoint = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) };
const AXIS_NEGATIVE: NrPoint = { x: Math.cos(Math.PI / 6), y: -Math.sin(Math.PI / 6) };
const guideThrough = (anchor: NrPoint, direction: NrPoint, extent = 1100) =>
    `M ${move({ x: anchor.x - direction.x * extent, y: anchor.y - direction.y * extent })} ` +
    `L ${move({ x: anchor.x + direction.x * extent, y: anchor.y + direction.y * extent })}`;

const N_BOTTOM_ANCHOR = shifted(project(N_OUTER[9], N), NR_DEPTH);
const R_BOTTOM_ANCHOR = shifted(project(R_OUTER[7], R), NR_DEPTH);
const TOP_GUIDE_ANCHOR = SURFACES
    .flatMap((surface) => surface.points)
    .reduce((highest, point) => (point.y < highest.y ? point : highest));

export const NR_GUIDE_PATHS = [
    guideThrough(TOP_GUIDE_ANCHOR, AXIS_NEGATIVE),
    guideThrough(N_BOTTOM_ANCHOR, AXIS_NEGATIVE),
    guideThrough(N_BOTTOM_ANCHOR, AXIS_POSITIVE),
    guideThrough(R_BOTTOM_ANCHOR, AXIS_POSITIVE),
];

export const NR_GEOMETRY = {
    viewBox: NR_VIEWBOX,
    depth: NR_DEPTH,
    glyphs: NR_GLYPHS,
    walls: NR_WALLS,
    topStroke: NR_TOP_STROKE,
    bottomStroke: NR_BOTTOM_STROKE,
    connectorPoints: NR_CONNECTOR_POINTS,
    guidePaths: NR_GUIDE_PATHS,
} as const;
