import { getCollection } from 'astro:content';
import { siteUrl } from '../data/siteContent';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const staticLastmod = '2026-09-08T00:00:00.000Z';

const renderUrl = ({
  path,
  lastmod,
  changefreq,
  priority,
}: {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority: number;
}) => {
  const loc = new URL(path, siteUrl).toString();
  return `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}<priority>${priority}</priority></url>`;
};

export async function GET() {
  const pages = [
    { path: '/', priority: 1.0, changefreq: 'monthly', lastmod: staticLastmod },
    { path: '/blog/', priority: 0.8, changefreq: 'weekly', lastmod: staticLastmod },
    { path: '/components/', priority: 0.7, changefreq: 'monthly', lastmod: staticLastmod },
    { path: '/components/isometric-generator/', priority: 0.6, changefreq: 'monthly', lastmod: staticLastmod },
  ];

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const urlset = [
    ...pages.map((page) => renderUrl(page)),
    ...posts.map((post) => renderUrl({
      path: `/blog/${post.slug}/`,
      lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
      priority: 0.7,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlset.join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
