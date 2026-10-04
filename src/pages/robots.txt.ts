import type { APIRoute } from 'astro';
import { INDEXABLE } from '../lib/site.ts';
import { withBase } from '../lib/url.ts';

/** noindex on the project URL; full crawl + sitemap only on the custom domain (SEO_STRATEGY.md). */
export const GET: APIRoute = ({ site }) => {
  const body = INDEXABLE
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL(withBase('/sitemap-index.xml'), site).toString()}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
