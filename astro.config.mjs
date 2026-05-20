import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  integrations: [svelte(), sitemap(), compress()],
  site: 'https://rebiz-loves-milfs.github.io',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
