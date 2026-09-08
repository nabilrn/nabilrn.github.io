export type SearchKind = 'page' | 'project' | 'blog';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  category: string;
  title: string;
  description: string;
  href: string;
  searchText: string;
  external?: boolean;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function buildSearchText(...parts: Array<string | string[] | null | undefined>): string {
  const flattened = parts.flatMap((part) => Array.isArray(part) ? part : [part ?? '']);
  return normalizeSearchText(flattened.join(' '));
}

export function scoreSearchEntry(entry: SearchEntry, rawQuery: string): number {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 1;

  const tokens = query.split(/\s+/).filter(Boolean);
  const title = normalizeSearchText(entry.title);
  const description = normalizeSearchText(entry.description);
  const haystack = entry.searchText || buildSearchText(entry.title, entry.description, entry.category);

  if (!tokens.every((token) => haystack.includes(token))) return 0;

  let score = 0;
  if (title === query) score += 140;
  else if (title.startsWith(query)) score += 100;
  else if (title.includes(query)) score += 76;

  if (description.includes(query)) score += 34;

  for (const token of tokens) {
    if (title === token) score += 28;
    else if (title.startsWith(token)) score += 20;
    else if (title.includes(token)) score += 14;

    if (description.includes(token)) score += 7;
    if (entry.category.toLowerCase().includes(token)) score += 5;
  }

  const kindBoost: Record<SearchKind, number> = {
    page: 8,
    project: 6,
    blog: 5,
  };

  return score + kindBoost[entry.kind];
}
