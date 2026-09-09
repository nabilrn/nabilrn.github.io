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

const escapeXml = (value: string) =>
	value
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

	if (lines.length < maxLines && current) {
		lines.push(current);
	}

	const consumedWords = lines.join(' ').split(/\s+/).length;
	if (consumedWords < words.length) {
		const last = lines[lines.length - 1] ?? '';
		lines[lines.length - 1] = clampText(last, Math.max(1, maxCharsPerLine - 3)).trimEnd() + '...';
	}

	return lines.slice(0, maxLines);
};

export const extractExcerpt = (markdown: string) => {
	const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, ' ');
	const paragraphs = withoutCodeBlocks
		.split(/\n\s*\n/)
		.map((chunk) => chunk.replace(/\n+/g, ' ').trim())
		.filter(Boolean);

	const firstBodyParagraph =
		paragraphs.find((p) => !/^([#>|-]|\d+\.)/.test(p) && !p.startsWith('![')) ??
		paragraphs[0] ??
		'';

	const plainText = firstBodyParagraph
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\[\^[^\]]+]/g, ' ')
		.replace(/[`*_~]/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	return clampText(plainText, 250);
};

interface OgCardData {
	title: string;
	excerpt: string;
	kicker: string;
}

interface PortfolioOgData {
	name: string;
	tagline: string;
}

const buildStaticNrSvg = () => {
	const viewBox = `${NR_VIEWBOX.x} ${NR_VIEWBOX.y} ${NR_VIEWBOX.width} ${NR_VIEWBOX.height}`;
	const guides = NR_GUIDE_PATHS.map((path) => `<path d="${path}"/>`).join('');
	const walls = NR_WALLS.map((wall) => `<path d="${nrWallPath(wall.a, wall.b)}"/>`).join('');
	const connectors = NR_CONNECTOR_POINTS.map((point) => `<path d="${nrConnectorPath(point)}"/>`).join('');
	const faces = NR_GLYPHS.map(
		(glyph) => `<path d="${glyph.path}" fill-rule="${glyph.fillRule}" clip-rule="${glyph.fillRule}"/>`,
	).join('');

	return `<svg x="36" y="58" width="720" height="432" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" overflow="hidden">
	<defs>
		<pattern id="og-nr-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
			<path d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2" fill="none" stroke="#333333" stroke-width="1"/>
		</pattern>
		<radialGradient id="og-nr-gradient" cx="385" cy="190" r="200" gradientUnits="userSpaceOnUse">
			<stop offset="0" stop-color="#f5f5f5" stop-opacity="0.96"/>
			<stop offset="1" stop-color="#52525b" stop-opacity="0"/>
		</radialGradient>
	</defs>
	<g fill="none" stroke="#242424" stroke-width="1" stroke-dasharray="4 2" opacity="0.72">${guides}</g>
	<g fill="none" stroke="url(#og-nr-gradient)" stroke-width="1" stroke-dasharray="4 2" opacity="0.24">${guides}</g>
	<g fill="#0a0a0a" fill-rule="evenodd" clip-rule="evenodd">${walls}</g>
	<path d="${NR_BOTTOM_STROKE}" fill="none" stroke="#4a4a4a" stroke-width="1" stroke-linejoin="miter"/>
	<path d="${NR_BOTTOM_STROKE}" fill="none" stroke="url(#og-nr-gradient)" stroke-width="1" stroke-linejoin="miter"/>
	<g fill="none" stroke="#4a4a4a" stroke-width="1">${connectors}</g>
	<g fill="none" stroke="url(#og-nr-gradient)" stroke-width="1">${connectors}</g>
	<g fill="#0a0a0a">${faces}</g>
	<g fill="url(#og-nr-pattern)">${faces}</g>
	<path d="${NR_TOP_STROKE}" fill="none" stroke="#4a4a4a" stroke-width="1" stroke-linejoin="miter"/>
	<path d="${NR_TOP_STROKE}" fill="none" stroke="url(#og-nr-gradient)" stroke-width="1" stroke-linejoin="miter"/>
</svg>`;
};

export const buildPortfolioOgSvg = ({ name, tagline }: PortfolioOgData) => `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="#0a0a0a"/>
	<rect x="32" y="32" width="1136" height="566" rx="18" fill="none" stroke="#1f1f1f"/>
	${buildStaticNrSvg()}
	<line x1="766" y1="120" x2="1110" y2="120" stroke="#262626" stroke-width="1"/>
	<text x="766" y="278" font-size="36" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" fill="#ededed">${escapeXml(name)}</text>
	<text x="766" y="326" font-size="24" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="500" fill="#8a8a8a">${escapeXml(tagline)}</text>
	<text x="766" y="514" font-size="16" font-family="JetBrains Mono, Consolas, monospace" font-weight="500" fill="#5f5f5f">portfolio.nabilrn.space</text>
</svg>`;

export const buildOgSvg = ({ title, excerpt, kicker }: OgCardData) => {
	const titleLines = wrapText(clampText(title, 150), 32, 3);
	const excerptLines = wrapText(clampText(excerpt, 240), 56, 3);

	const renderedTitle = titleLines
		.map(
			(line, index) =>
				`<text x="88" y="${204 + index * 66}" font-size="58" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" fill="#ededed">${escapeXml(
					line
				)}</text>`,
		)
		.join('');

	const renderedExcerpt = excerptLines
		.map(
			(line, index) =>
				`<text x="88" y="${438 + index * 38}" font-size="27" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="400" fill="#a3a3a3">${escapeXml(
					line
				)}</text>`,
		)
		.join('');

	return `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <circle cx="88" cy="103" r="7" fill="#737373"/>
  <text x="110" y="112" font-size="25" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="600" fill="#ededed">${escapeXml(kicker)}</text>
  <text x="1094" y="112" text-anchor="end" font-size="20" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="500" fill="#737373">portfolio.nabilrn.space</text>
  <line x1="88" y1="146" x2="1112" y2="146" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  ${renderedTitle}
  <line x1="88" y1="386" x2="1112" y2="386" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1"/>
  ${renderedExcerpt}
  <text x="88" y="558" font-size="21" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="500" fill="#737373">Software Engineer — AI Agents — Infrastructure</text>
</svg>`;
};
