import type { CollectionEntry } from 'astro:content';

// Compatibility alias while the article page drops its old locale-shaped props.
// Runtime blog content is English-only.
export type BlogLocale = string;
type BlogEntry = CollectionEntry<'blog'>;

const legacyEnglishSuffixPattern = /([-_])(en|eng)$/i;

export const getLocaleFromSlug = (_slug: string): 'en' => 'en';

export const getTranslationKeyFromSlug = (slug: string): string =>
	slug.replace(legacyEnglishSuffixPattern, '');

export const getBlogLocaleInfo = (post: BlogEntry) => ({
	locale: 'en' as const,
	translationKey: getTranslationKeyFromSlug(post.slug),
});

export const getTranslationVariants = (posts: BlogEntry[], translationKey: string) => {
	const candidate = posts.find((post) => getBlogLocaleInfo(post).translationKey === translationKey);
	return candidate ? { en: candidate } : {};
};
