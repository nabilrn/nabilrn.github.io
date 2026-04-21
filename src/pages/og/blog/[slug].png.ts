import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { buildOgSvg, extractExcerpt } from '../../../utils/og';

export async function getStaticPaths() {
	const posts = await getCollection('blog', ({ data }) => !data.draft);

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: {
			title: post.data.title,
			excerpt: extractExcerpt(post.body),
		},
	}));
}

interface Props {
	title: string;
	excerpt: string;
}

export async function GET({ props }: { props: Props }) {
	const svg = buildOgSvg({
		title: props.title,
		excerpt: props.excerpt,
		kicker: 'nabilrn / blog',
	});

	const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
