import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

const devBase = process.env.NODE_ENV === 'development' ? '/' : '/song-selector/';

export default defineConfig({
  integrations: [vue()],
  site: 'https://enonbaptistchurch.github.io/song-selector/',
  base: devBase,
  build: { outDir: 'dist' },
});