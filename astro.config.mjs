// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Deployment target is configured via environment variables so the same build
 * runs on GitHub Pages (project URL), GitHub Pages (custom domain) and the
 * Cloudflare Pages fallback (ADR-001). Defaults match the current project URL.
 *
 *   SITE_URL   https://thafridge.github.io   (later: https://railkorting.nl)
 *   BASE_PATH  /railkorting.nl               (later: /)
 *   INDEXABLE  false                         (true only on the custom domain)
 */
const site = process.env.SITE_URL ?? 'https://thafridge.github.io';
const base = process.env.BASE_PATH ?? '/railkorting.nl';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    sitemap({
      // Utility pages are not landing pages (SEO_STRATEGY.md).
      filter: (page) => !/\/(zoeken|404)\/$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
