// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://nabilrizkinavisa.me',
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
