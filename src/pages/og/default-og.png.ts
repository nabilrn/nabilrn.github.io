import sharp from 'sharp';
import { buildPortfolioOgSvg } from '../../utils/og';

export async function GET() {
	const svg = buildPortfolioOgSvg({
		name: 'Nabil Rizki Navisa',
		tagline: 'daily prompter.',
	});
	const png = await sharp(new TextEncoder().encode(svg)).png({ compressionLevel: 9 }).toBuffer();

	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
