// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://github.com/yshrkn/',
  base: 'dev_journal',
  integrations: [mdx(), sitemap()],
});
