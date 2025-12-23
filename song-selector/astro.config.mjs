import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  integrations: [vue()],
  site: 'https://enonbaptistchurch.github.io/song-selector/', // your GitHub Pages URL
  base: '/song-selector/',                      // important for assets
  build: { outDir: 'dist' },                   // default Astro build folder
});
