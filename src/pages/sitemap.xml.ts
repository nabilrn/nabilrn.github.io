import { getCollection } from 'astro:content';
import { localizePath, siteUrl, supportedLocales } from '../data/siteContent';
import { getBlogLocaleInfo } from '../utils/blogLocale';

export async function GET() {
  const pages = [
    { path: '/', priority: 1.0, changefreq: 'monthly' },
    { path: '/projects/', priority: 0.9, changefreq: 'weekly' },
    { path: '/blog/', priority: 0.8, changefreq: 'weekly' },
  ];

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const urlset = [];
  for (const locale of supportedLocales) {
    for (const p of pages) {
      const loc = new URL(localizePath(p.path, locale), siteUrl).toString();
      urlset.push(`<url><loc>${loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`);
    }
  }

  for (const post of posts) {
    const lastmod = (post.data.updatedDate ?? post.data.pubDate).toISOString();
    const locale = getBlogLocaleInfo(post).locale;
    const loc = new URL(localizePath(`/blog/${post.slug}/`, locale), siteUrl).toString();
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
