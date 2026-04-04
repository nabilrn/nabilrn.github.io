// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://nabilrizkinavisa.me',
    base: '/',
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
