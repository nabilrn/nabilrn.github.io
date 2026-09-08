import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { webProjects } from '../data/projects';
import { getSiteContent } from '../data/siteContent';
import { buildSearchText, type SearchEntry } from '../lib/search';

export const prerender = true;

const slugify = (value: string) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

const componentEntries: SearchEntry[] = [
  {
    id: 'component-global-search',
    kind: 'component',
    category: 'Components',
    title: 'Global Search',
    description: 'Ctrl/Cmd K portfolio-wide grouped search dialog.',
    href: '/components/#global-search',
    searchText: buildSearchText('global search command palette ctrl k cmd k component'),
  },
  {
    id: 'component-theme-toggle',
    kind: 'component',
    category: 'Components',
    title: 'Theme Toggle',
    description: 'Dark and light mode toggle with a full-screen pixel transition.',
    href: '/components/#theme-toggle',
    searchText: buildSearchText('theme toggle dark light pixel transition component'),
  },
  {
    id: 'component-project-card',
    kind: 'component',
    category: 'Components',
    title: 'Project Card',
    description: 'Monochrome project preview card used by the portfolio carousel.',
    href: '/components/#project-card',
    searchText: buildSearchText('project card preview carousel component'),
  },
  {
    id: 'component-engagement-bar',
    kind: 'component',
    category: 'Components',
    title: 'Engagement Bar',
    description: 'Views, likes, and sharing controls for blog posts.',
    href: '/components/#engagement-bar',
    searchText: buildSearchText('engagement views likes share blog component'),
  },
  {
    id: 'component-isometric-mark',
    kind: 'component',
    category: 'Components',
    title: 'Isometric Mark',
    description: 'Angular vector isometric mark using the portfolio NR visual language.',
    href: '/components/#isometric-mark',
    searchText: buildSearchText('isometric mark letter generator vector geometry nr component'),
  },
];

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
      searchText: buildSearchText('overview home portfolio', site.profile.name, site.seo.defaultDescription, site.schema.knowsAbout),
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
      description: 'Original portfolio component previews with recreation prompts and native ZIP downloads.',
      href: '/components/',
      searchText: buildSearchText('components gallery preview prompt native html css js svg zip design system'),
    },
    {
      id: 'page-isometric-generator',
      kind: 'page',
      category: 'Pages',
      title: 'A–Z Isometric Generator',
      description: 'Generate angular vector A–Z marks in the NR visual language and export native SVG or ZIP.',
      href: '/components/isometric-generator/',
      searchText: buildSearchText('isometric generator letters az vector svg native zip nr geometry'),
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
      searchText: buildSearchText(post.data.title, post.data.description, post.data.tags, post.body),
    }));

  const entries = [...pages, ...projects, ...blog, ...componentEntries];

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
