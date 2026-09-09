import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { buildArticleOgSvg } from '../../../utils/og';

export async function getStaticPaths() {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.data.title,
			description: post.data.description,
			publishedDate: post.data.pubDate.toLocaleDateString('en-US', {
				month: 'short',
				day: '2-digit',
				year: 'numeric',
				timeZone: 'UTC',
			}),
			tags: post.data.tags,
		},
	}));
}

interface Props {
	title: string;
	description: string;
	publishedDate: string;
	tags: string[];
}

export async function GET({ props }: { props: Props }) {
	const svg = buildArticleOgSvg({
		title: props.title,
		description: props.description,
		publishedDate: props.publishedDate,
		tags: props.tags,
	});
	const png = await sharp(new TextEncoder().encode(svg)).png({ compressionLevel: 9 }).toBuffer();
	return new Response(new Uint8Array(png), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
