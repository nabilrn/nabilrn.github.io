import type { CollectionEntry } from 'astro:content';

export type BlogLocale = 'en';
type BlogEntry = CollectionEntry<'blog'>;

const legacyEnglishSuffixPattern = /([-_])(en|eng)$/i;

export const getLocaleFromSlug = (_slug: string): BlogLocale => 'en';

export const getTranslationKeyFromSlug = (slug: string): string =>
	slug.replace(legacyEnglishSuffixPattern, '');

export const getBlogLocaleInfo = (post: BlogEntry) => ({
	locale: 'en' as const,
	translationKey: post.data.translationKey?.trim() || getTranslationKeyFromSlug(post.slug),
});

export const getTranslationVariants = (posts: BlogEntry[], translationKey: string) => {
	const candidate = posts.find((post) => getBlogLocaleInfo(post).translationKey === translationKey);
	return candidate ? { en: candidate } : {};
};
