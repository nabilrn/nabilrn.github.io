export const OG_SIZE = 1200;

const escapeXml = (value: string) =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');

const clampText = (value: string, maxLength: number) => {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength - 1).trimEnd()}...`;
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
	const titleLines = wrapText(clampText(title, 160), 28, 4);
	const excerptLines = wrapText(clampText(excerpt, 260), 50, 6);

	const renderedTitle = titleLines
		.map(
			(line, index) =>
				`<text x="124" y="${336 + index * 88}" font-size="72" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" fill="#e6edf3">${escapeXml(
					line
				)}</text>`
		)
		.join('');

	const renderedExcerpt = excerptLines
		.map(
			(line, index) =>
				`<text x="124" y="${760 + index * 54}" font-size="38" font-family="Inter, Segoe UI, Arial, sans-serif" fill="#8b949e">${escapeXml(
					line
				)}</text>`
		)
		.join('');

	return `<svg width="${OG_SIZE}" height="${OG_SIZE}" viewBox="0 0 ${OG_SIZE} ${OG_SIZE}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="1200" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0d1117"/>
      <stop offset="1" stop-color="#161b22"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#58a6ff"/>
      <stop offset="1" stop-color="#3fb950"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <rect x="68" y="68" width="1064" height="1064" rx="48" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
  <rect x="124" y="142" width="350" height="14" rx="7" fill="url(#accent)"/>
  <text x="124" y="214" font-size="34" font-family="Inter, Segoe UI, Arial, sans-serif" fill="#8b949e">${escapeXml(kicker)}</text>
  ${renderedTitle}
  <line x1="124" y1="690" x2="1074" y2="690" stroke="#30363d" stroke-width="2"/>
  ${renderedExcerpt}
  <text x="124" y="1086" font-size="30" font-family="Inter, Segoe UI, Arial, sans-serif" fill="#6e7681">nabilrizkinavisa.me</text>
</svg>`;
};
