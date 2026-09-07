// Public locale surface for the redesigned portfolio.
//
// The legacy content module remains temporarily intact while Phase 2 removes
// old routes and consumers. Explicit exports below override its wider locale
// lists, so all current UI, metadata, sitemap, and static route generators only
// expose English and Indonesian.
export * from './siteContentLegacy';

export const supportedLocales = ['en', 'id'] as const;
export const localizedLocales = ['id'] as const;
