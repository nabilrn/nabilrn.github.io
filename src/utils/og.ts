import {
	NR_BOTTOM_STROKE,
	NR_CONNECTOR_POINTS,
	NR_GLYPHS,
	NR_GUIDE_PATHS,
	NR_TOP_STROKE,
	NR_VIEWBOX,
	NR_WALLS,
	nrConnectorPath,
	nrWallPath,
} from '../lib/nrGeometry';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_VERSION = 'v3';

export const withOgVersion = (path: string) => {
	const separator = path.includes('?') ? '&' : '?';
	return `${path}${separator}v=${OG_VERSION}`;
};

const escapeXml = (value: string) => value
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&apos;');

const clampText = (value: string, maxLength: number) => {
	if (value.length <= maxLength) return value;
	const trimmed = value.slice(0, Math.max(1, maxLength - 3)).trimEnd().replace(/[.,;:!?]+$/g, '');
	return `${trimmed}...`;
};

export const wrapText = (value: string, maxCharsPerLine: number, maxLines: number) => {
	const words = value.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];
	const lines: string[] = [];
	let current = '';
	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (next.length <= maxCharsPerLine) {
			current = next;
			continue;
		}
		if (current) lines.push(current);
		current = word;
		if (lines.length === maxLines) break;
	}
	if (lines.length < maxLines && current) lines.push(current);
	const consumedWords = lines.join(' ').split(/\s+/).length;
	if (consumedWords < words.length && lines.length > 0) {
		const last = lines[lines.length - 1] ?? '';
		lines[lines.length - 1] = `${clampText(last, Math.max(1, maxCharsPerLine - 3)).trimEnd()}...`;
	}
	return lines.slice(0, maxLines);
};

interface PortfolioOgData {
	name: string;
	tagline: string;
}

interface ArticleOgData {
	title: string;
	description: string;
	publishedDate: string;
	tags: string[];
}

interface StaticNrOptions {
	x: number;
	y: number;
	width: number;
	height: number;
	idPrefix: string;
	showGuides?: boolean;
}

const buildStaticNrSvg = ({ x, y, width, height, idPrefix, showGuides = true }: StaticNrOptions) => {
	const viewBox = `${NR_VIEWBOX.x} ${NR_VIEWBOX.y} ${NR_VIEWBOX.width} ${NR_VIEWBOX.height}`;
	const guides = NR_GUIDE_PATHS.map((path) => `<path d="${path}"/>`).join('');
	const walls = NR_WALLS.map((wall) => `<path d="${nrWallPath(wall.a, wall.b)}"/>`).join('');
	const connectors = NR_CONNECTOR_POINTS.map((point) => `<path d="${nrConnectorPath(point)}"/>`).join('');
	const faces = NR_GLYPHS.map((glyph) => `<path d="${glyph.path}" fill-rule="${glyph.fillRule}" clip-rule="${glyph.fillRule}"/>`).join('');
	const patternId = `${idPrefix}-nr-pattern`;
	const gradientId = `${idPrefix}-nr-gradient`;

	return `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" overflow="hidden">
	<defs>
		<pattern id="${patternId}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2" fill="none" stroke="#333333" stroke-width="1"/></pattern>
		<radialGradient id="${gradientId}" cx="385" cy="190" r="200" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f5f5f5" stop-opacity="0.96"/><stop offset="1" stop-color="#52525b" stop-opacity="0"/></radialGradient>
	</defs>
	${showGuides ? `<g fill="none" stroke="#242424" stroke-width="1" stroke-dasharray="4 2" opacity="0.72">${guides}</g><g fill="none" stroke="url(#${gradientId})" stroke-width="1" stroke-dasharray="4 2" opacity="0.24">${guides}</g>` : ''}
	<g fill="#0a0a0a" fill-rule="evenodd" clip-rule="evenodd">${walls}</g>
	<path d="${NR_BOTTOM_STROKE}" fill="none" stroke="#4a4a4a" stroke-width="1" stroke-linejoin="miter"/>
	<path d="${NR_BOTTOM_STROKE}" fill="none" stroke="url(#${gradientId})" stroke-width="1" stroke-linejoin="miter"/>
	<g fill="none" stroke="#4a4a4a" stroke-width="1">${connectors}</g><g fill="none" stroke="url(#${gradientId})" stroke-width="1">${connectors}</g>
	<g fill="#0a0a0a">${faces}</g><g fill="url(#${patternId})">${faces}</g>
	<path d="${NR_TOP_STROKE}" fill="none" stroke="#4a4a4a" stroke-width="1" stroke-linejoin="miter"/><path d="${NR_TOP_STROKE}" fill="none" stroke="url(#${gradientId})" stroke-width="1" stroke-linejoin="miter"/>
</svg>`;
};

export const buildPortfolioOgSvg = (_data: PortfolioOgData) => `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#0a0a0a"/>
	${buildStaticNrSvg({ x: 220, y: 87, width: 760, height: 456, idPrefix: 'portfolio', showGuides: false })}
</svg>`;

export const buildArticleOgSvg = ({ title, description, publishedDate, tags }: ArticleOgData) => {
	const titleLines = wrapText(clampText(title, 132), title.length > 72 ? 31 : 35, 2);
	const titleSize = titleLines.length > 1 ? 50 : 56;
	const titleLineHeight = titleLines.length > 1 ? 57 : 64;
	const descriptionLines = wrapText(clampText(description, 190), 72, 2);
	const renderedTitle = titleLines.map((line, index) => `<text x="92" y="${205 + index * titleLineHeight}" font-size="${titleSize}" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="-1.4" fill="#ededed">${escapeXml(line)}</text>`).join('');
	const renderedDescription = descriptionLines.map((line, index) => `<text x="92" y="${350 + index * 31}" font-size="22" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="450" fill="#9a9a9a">${escapeXml(line)}</text>`).join('');
	const renderedTags = tags.slice(0, 3).map((tag) => `#${tag.toLowerCase().replace(/\s+/g, '-')}`).join('   ');

	return `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#0a0a0a"/>
	<rect x="48" y="40" width="1104" height="550" rx="22" fill="#0b0b0b" stroke="#242424"/>
	<circle cx="94" cy="91" r="28" fill="#151515" stroke="#303030"/>
	<text x="94" y="98" text-anchor="middle" font-size="17" font-family="JetBrains Mono, Consolas, monospace" font-weight="700" fill="#dedede">NR</text>
	<text x="138" y="82" font-size="22" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" fill="#ededed">Nabil Rizki Navisa</text>
	<text x="138" y="108" font-size="16" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="450" fill="#777777">@NabilrizkiN · ${escapeXml(publishedDate)}</text>
	${renderedTitle}
	${renderedDescription}
	<rect x="82" y="430" width="1036" height="126" rx="14" fill="#0f0f0f" stroke="#282828"/>
	<text x="108" y="467" font-size="14" font-family="JetBrains Mono, Consolas, monospace" font-weight="600" letter-spacing=".6" fill="#777777">PORTFOLIO.NABILRN.SPACE / BLOG</text>
	<text x="108" y="503" font-size="17" font-family="JetBrains Mono, Consolas, monospace" font-weight="500" fill="#8a8a8a">${escapeXml(renderedTags)}</text>
	<text x="108" y="536" font-size="14" font-family="JetBrains Mono, Consolas, monospace" font-weight="600" fill="#d4d4d4">READ ARTICLE ↗</text>
	${buildStaticNrSvg({ x: 870, y: 423, width: 220, height: 132, idPrefix: 'article-preview', showGuides: false })}
</svg>`;
};
