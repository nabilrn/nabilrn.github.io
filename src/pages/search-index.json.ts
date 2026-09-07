import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { webProjects } from '../data/projects';
import { getSiteContent } from '../data/siteContent';
import { buildComponentCatalog } from '../lib/componentCatalog';
import { buildSearchText, type SearchEntry } from '../lib/search';

export const prerender = true;

const slugify = (value: string) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

export const GET: APIRoute = async () => {
  const site = getSiteContent();
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const componentCatalog = buildComponentCatalog();

  const pages: SearchEntry[] = [
    {
      id: 'page-home',
      kind: 'page',
      category: 'Pages',
      title: 'Overview',
      description: site.seo.defaultDescription,
      href: '/',
      searchText: buildSearchText(
        'overview home portfolio',
        site.profile.name,
        site.seo.defaultDescription,
        site.schema.knowsAbout,
      ),
    },
    {
      id: 'page-blog',
      kind: 'page',
      category: 'Pages',
      title: 'Blog',
      description: site.blog.seoDescription,
      href: '/blog/',
      searchText: buildSearchText('blog writing articles', site.blog.seoDescription),
    },
    {
      id: 'page-components',
      kind: 'page',
      category: 'Pages',
      title: 'Components',
      description: 'Browse portfolio components, live previews, Astro source, TypeScript companions, and extracted CSS.',
      href: '/components/',
      searchText: buildSearchText('components component explorer design system source preview astro typescript css'),
    },
    {
      id: 'page-isometric-generator',
      kind: 'page',
      category: 'Pages',
      title: 'Isometric A–Z Generator',
      description: 'Generate modular technical-isometric A–Z marks with depth, hatch, guide, Astro, SVG, and runnable ZIP exports.',
      href: '/components/isometric-generator/',
      searchText: buildSearchText('isometric generator alphabet a z glyph character depth hatch guide astro svg zip component'),
    },
  ];

  const projects: SearchEntry[] = webProjects.map((project, index) => ({
    id: `project-${slugify(project.name)}-${index}`,
    kind: 'project',
    category: 'Projects',
    title: project.name,
    description: project.desc,
    href: project.liveUrl,
    external: true,
    searchText: buildSearchText(project.name, project.desc, project.stack),
  }));

  const blog: SearchEntry[] = posts
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((post) => ({
      id: `blog-${post.slug}`,
      kind: 'blog',
      category: 'Blog',
      title: post.data.title,
      description: post.data.description,
      href: `/blog/${post.slug}/`,
      searchText: buildSearchText(
        post.data.title,
        post.data.description,
        post.data.tags,
        post.body,
      ),
    }));

  const components: SearchEntry[] = componentCatalog.map((entry) => ({
    id: `component-${entry.id}`,
    kind: 'component' as const,
    category: `${entry.category} components`,
    title: entry.name,
    description: `${entry.path}${entry.previewId ? ' · live preview' : ' · source only'}`,
    href: `/components/?component=${encodeURIComponent(entry.id)}`,
    searchText: buildSearchText(
      entry.name,
      entry.category,
      entry.path,
      entry.source,
      entry.css,
      entry.scripts.flatMap((script) => [script.path, script.source]),
    ),
  }));

  const entries = [...pages, ...projects, ...blog, ...components];

  return new Response(JSON.stringify({
    generatedAt: new Date().toISOString(),
    count: entries.length,
    entries,
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
};
