export interface ComponentScriptSource {
  name: string;
  path: string;
  source: string;
}

export interface ComponentCatalogEntry {
  id: string;
  name: string;
  category: string;
  path: string;
  source: string;
  css: string;
  scripts: ComponentScriptSource[];
  previewId?: string;
}

const astroSources = import.meta.glob('/src/components/**/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const scriptSources = import.meta.glob('/src/components/**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const slugifyComponent = (value: string) => value
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();

export const componentCategory = (path: string) => {
  if (path.includes('/components/home/')) return 'Home';
  if (path.includes('/components/blog/')) return 'Blog';
  if (path.includes('/components/icons/')) return 'Icons';
  return 'Primitives';
};

const normalizeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const previewIds: Record<string, string> = {
  'src/components/home/VerifiedIcon.astro': 'verified-icon',
  'src/components/icons/UiIcon.astro': 'ui-icon',
  'src/components/icons/BrandIcon.astro': 'brand-icon',
  'src/components/home/HandwrittenNote.astro': 'handwritten-note',
  'src/components/home/ProjectCard.astro': 'project-card',
};

const extractCss = (source: string) => {
  const blocks = [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);
  return blocks.join('\n\n/* --- next style block --- */\n\n');
};

export const buildComponentCatalog = (): ComponentCatalogEntry[] => Object.entries(astroSources)
  .map(([rawPath, source]) => {
    const path = rawPath.replace(/^\//, '');
    const fileName = path.split('/').pop() ?? path;
    const name = fileName.replace(/\.astro$/i, '');
    const directory = path.slice(0, Math.max(0, path.lastIndexOf('/')));
    const normalizedStem = normalizeName(name);

    const scripts = Object.entries(scriptSources)
      .map(([scriptPath, scriptSource]) => ({
        path: scriptPath.replace(/^\//, ''),
        source: scriptSource,
      }))
      .filter((script) => {
        const scriptDirectory = script.path.slice(0, Math.max(0, script.path.lastIndexOf('/')));
        if (scriptDirectory !== directory) return false;
        const scriptName = (script.path.split('/').pop() ?? '').replace(/\.ts$/i, '');
        const normalizedScript = normalizeName(scriptName);
        return normalizedScript.startsWith(normalizedStem) || normalizedStem.startsWith(normalizedScript);
      })
      .map((script) => ({
        name: script.path.split('/').pop() ?? script.path,
        path: script.path,
        source: script.source,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));

    return {
      id: slugifyComponent(path.replace(/^src\/components\//, '').replace(/\.astro$/i, '')),
      name,
      category: componentCategory(path),
      path,
      source,
      css: extractCss(source),
      scripts,
      previewId: previewIds[path],
    } satisfies ComponentCatalogEntry;
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
