import { getCollection } from 'astro:content';

export async function GET() {
  const siteUrl = 'https://nabilrizkinavisa.me';
  const pages = [
    { url: '', priority: 1.0 },
    { url: 'blog/', priority: 0.8 },
  ];

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const urlset = [];
  for (const p of pages) {
    urlset.push(`<url><loc>${siteUrl}/${p.url}</loc><priority>${p.priority}</priority></url>`);
  }

  for (const post of posts) {
    const loc = `${siteUrl}/blog/${post.slug}/`;
    const lastmod = post.data.pubDate.toISOString();
    urlset.push(`<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlset.join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
