import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
  site: 'https://enonbaptistchurch.github.io/song-selector/', // your subpath
  base: '/song-selector/', // important for CSS/JS assets
  build: {
    outDir: 'dist', // default
  },
});
