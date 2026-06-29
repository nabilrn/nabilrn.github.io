import sharp from 'sharp';
import { buildOgSvg } from '../../utils/og';

export async function GET() {
	const svg = buildOgSvg({
		title: 'Nabil Rizki Navisa',
		excerpt: 'Software engineer and Information Systems graduate from Universitas Andalas. GPA 3.71. AI agents, web, mobile, and IT infrastructure.',
		kicker: 'nabilrn / portfolio',
	});

	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
