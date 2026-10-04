/**
 * Internal link check over dist/ (TESTING.md). Every same-site href/src must
 * resolve to a file in dist/. External links are not fetched (no network in CI tests).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const BASE = (process.env.BASE_PATH ?? '/railkorting.nl').replace(/\/+$/, '');

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

async function exists(rel: string): Promise<boolean> {
  const candidates = rel.endsWith('/') || rel === '' ? [path.join(DIST, rel, 'index.html')] : [path.join(DIST, rel), path.join(DIST, rel, 'index.html')];
  for (const c of candidates) {
    try {
      if ((await stat(c)).isFile()) return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

const htmlFiles = await walk(DIST);
const broken: string[] = [];
let checked = 0;
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const url = m[1]!;
    if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(url)) continue;
    let rel: string;
    if (url.startsWith('/')) {
      if (BASE && !url.startsWith(BASE + '/') && url !== BASE) {
        broken.push(`${path.relative(DIST, file)} → ${url} (mist base path ${BASE})`);
        continue;
      }
      rel = url.slice(BASE.length).replace(/^\//, '');
    } else {
      rel = path.relative(DIST, path.resolve(path.dirname(file), url));
    }
    checked++;
    if (!(await exists(rel))) broken.push(`${path.relative(DIST, file)} → ${url}`);
  }
}
console.log(`[links] ${checked} interne links gecontroleerd in ${htmlFiles.length} pagina's`);
if (broken.length) {
  console.error('[links] FAIL\n - ' + [...new Set(broken)].join('\n - '));
  process.exit(1);
}
console.log('[links] OK');
