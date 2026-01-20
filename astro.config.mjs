// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://nabilrn.github.io',
    base: '/',
    integrations: [sitemap()],
    build: {
        assets: 'assets'
    },
    compressHTML: true,
    vite: {
        build: {
            cssMinify: true
        }
    }
});
