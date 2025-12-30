import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

const devBase = process.env.NODE_ENV === 'development' ? '/' : '/song-selector/';

export default defineConfig({
  integrations: [vue(), tailwind()],
  site: 'https://enonbaptistchurch.github.io',
  base: devBase,
  build: { outDir: 'dist' },
});