import { getCollection } from 'astro:content';
import { localeMeta, localizePath, siteUrl, supportedLocales, type SiteLocale } from '../data/siteContent';
import { getBlogLocaleInfo, getTranslationVariants } from '../utils/blogLocale';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const staticLastmod = '2026-06-29T00:00:00.000Z';

const alternateLinks = (paths: Partial<Record<SiteLocale, string>>) => {
  const links = supportedLocales
    .filter((locale) => paths[locale])
    .map((locale) => {
      const href = new URL(paths[locale]!, siteUrl).toString();
      return `<xhtml:link rel="alternate" hreflang="${localeMeta[locale].htmlLang}" href="${escapeXml(href)}" />`;
    });

  if (paths.en) {
    links.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(new URL(paths.en, siteUrl).toString())}" />`);
  }

  return links.join('');
};

const renderUrl = ({
  loc,
  lastmod,
  changefreq,
  priority,
  alternates,
}: {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority: number;
  alternates?: Partial<Record<SiteLocale, string>>;
}) =>
  `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${changefreq ? `<changefreq>${changefreq}</changefreq>` : ''}<priority>${priority}</priority>${alternates ? alternateLinks(alternates) : ''}</url>`;

export async function GET() {
  const pages = [
    { path: '/', priority: 1.0, changefreq: 'monthly', lastmod: staticLastmod },
    { path: '/projects/', priority: 0.9, changefreq: 'weekly', lastmod: staticLastmod },
    { path: '/blog/', priority: 0.8, changefreq: 'weekly', lastmod: staticLastmod },
  ];

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  const urlset = [];
  for (const locale of supportedLocales) {
    for (const p of pages) {
      const loc = new URL(localizePath(p.path, locale), siteUrl).toString();
      const alternates = Object.fromEntries(
        supportedLocales.map((alternateLocale) => [alternateLocale, localizePath(p.path, alternateLocale)])
      ) as Record<SiteLocale, string>;
      urlset.push(renderUrl({
        loc,
        lastmod: p.lastmod,
        changefreq: p.changefreq,
        priority: p.priority,
        alternates,
      }));
    }
  }

  for (const post of posts) {
    const lastmod = (post.data.updatedDate ?? post.data.pubDate).toISOString();
    const localeInfo = getBlogLocaleInfo(post);
    const locale = localeInfo.locale;
    const loc = new URL(localizePath(`/blog/${post.slug}/`, locale), siteUrl).toString();
    const variants = getTranslationVariants(posts, localeInfo.translationKey);
    const alternates = Object.fromEntries(
      supportedLocales
        .filter((alternateLocale) => variants[alternateLocale])
        .map((alternateLocale) => [
          alternateLocale,
          localizePath(`/blog/${variants[alternateLocale]!.slug}/`, alternateLocale),
        ])
    ) as Partial<Record<SiteLocale, string>>;
    urlset.push(renderUrl({
      loc,
      lastmod,
      priority: 0.7,
      alternates,
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${urlset.join('\n')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  });
}
