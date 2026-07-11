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

export const buildOgSvg = ({ title, excerpt, kicker }: OgCardData) => {
	const titleLines = wrapText(clampText(title, 150), 32, 3);
	const excerptLines = wrapText(clampText(excerpt, 240), 56, 3);

	const renderedTitle = titleLines
		.map(
			(line, index) =>
				`<text x="88" y="${204 + index * 66}" font-size="58" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" fill="#ffffff">${escapeXml(
					line
				)}</text>`
		)
		.join('');

	const renderedExcerpt = excerptLines
		.map(
			(line, index) =>
				`<text x="88" y="${438 + index * 38}" font-size="27" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="400" fill="#ffffff" opacity="0.72">${escapeXml(
					line
				)}</text>`
		)
		.join('');

	return `<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#030303"/>
  <rect x="40" y="38" width="1120" height="554" rx="28" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.5"/>
  <text x="88" y="112" font-size="25" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="600" fill="#ffffff" opacity="0.78">${escapeXml(kicker)}</text>
  <text x="1094" y="112" text-anchor="end" font-size="20" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="500" fill="#ffffff" opacity="0.58">portfolio.nabilrn.space</text>
  <line x1="88" y1="146" x2="1112" y2="146" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
  ${renderedTitle}
  <line x1="88" y1="386" x2="1112" y2="386" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1"/>
  ${renderedExcerpt}
  <text x="88" y="558" font-size="21" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="500" fill="#ffffff" opacity="0.62">Software Engineer / Information Systems Graduate</text>
</svg>`;
};
