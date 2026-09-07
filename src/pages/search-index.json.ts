import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { webProjects } from '../data/projects';
import { getSiteContent } from '../data/siteContent';
import { buildSearchText, type SearchEntry } from '../lib/search';

export const prerender = true;

const componentSources = import.meta.glob('/src/components/**/*.{astro,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const slugify = (value: string) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const componentCategory = (path: string) => {
  if (path.includes('/components/home/')) return 'Home components';
  if (path.includes('/components/blog/')) return 'Blog components';
  if (path.includes('/components/icons/')) return 'Icon components';
  return 'Core components';
};

export const GET: APIRoute = async () => {
  const site = getSiteContent();
  const posts = await getCollection('blog', ({ data }) => !data.draft);

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

  const components: SearchEntry[] = Object.entries(componentSources)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sourcePath, source]) => {
      const filePath = sourcePath.replace(/^\//, '');
      const fileName = filePath.split('/').pop() ?? filePath;
      const name = fileName.replace(/\.(astro|ts)$/i, '');
      const category = componentCategory(filePath);

      return {
        id: `component-${slugify(filePath)}`,
        kind: 'component' as const,
        category,
        title: name,
        description: `Source component · ${filePath}`,
        href: `https://github.com/nabilrn/nabilrn.github.io/blob/main/${filePath}`,
        external: true,
        searchText: buildSearchText(name, category, filePath, source),
      };
    });

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
