import type { CollectionEntry } from 'astro:content';

export type BlogLocale = 'en' | 'id';
type BlogEntry = CollectionEntry<'blog'>;

const slugSuffixPattern = /([-_])(id|en|eng)$/i;

const normalizeLocale = (value?: string): BlogLocale | undefined => {
	if (!value) return undefined;
	const normalized = value.toLowerCase();
	if (normalized === 'id') return 'id';
	if (normalized === 'en' || normalized === 'eng') return 'en';
	return undefined;
};

export const getLocaleFromSlug = (slug: string): BlogLocale => {
	const match = slug.match(slugSuffixPattern);
	if (!match) return 'en';
	return normalizeLocale(match[2]) ?? 'en';
};

export const getTranslationKeyFromSlug = (slug: string): string => slug.replace(slugSuffixPattern, '');

export const getBlogLocaleInfo = (post: BlogEntry) => {
	const locale = normalizeLocale(post.data.locale) ?? getLocaleFromSlug(post.slug);
	const translationKey = post.data.translationKey?.trim() || getTranslationKeyFromSlug(post.slug);
	return { locale, translationKey };
};

export const getTranslationVariants = (posts: BlogEntry[], translationKey: string) => {
	const variants: Partial<Record<BlogLocale, BlogEntry>> = {};
	for (const candidate of posts) {
		const info = getBlogLocaleInfo(candidate);
		if (info.translationKey !== translationKey) continue;
		variants[info.locale] = candidate;
	}
	return variants;
};
