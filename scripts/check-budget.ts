/**
 * Size budgets from ARCHITECTURE.md / ADR-001 / UX_GUIDELINES.md, checked against dist/.
 * Fails the build when exceeded. Host-agnostic.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = path.resolve(import.meta.dirname, '../dist');
const BUDGET = {
  siteBytes: 200 * 1024 * 1024, // internal target ≤ 200 MB (hard Pages limit 1 GB)
  reachabilityGzip: 100 * 1024, // per station file
  destinationsIndexGzip: 300 * 1024,
  homepageJs: 100 * 1024, // sum of JS referenced by the homepage
} as const;

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const gz = (buf: Buffer) => gzipSync(buf).length;
const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const failures: string[] = [];

const files = await walk(DIST);
let total = 0;
for (const f of files) total += (await stat(f)).size;
console.log(`[budget] site: ${(total / 1024 / 1024).toFixed(1)} MB in ${files.length} files`);
if (total > BUDGET.siteBytes) failures.push(`site ${kb(total)} > ${kb(BUDGET.siteBytes)}`);

for (const f of files.filter((f) => /[\\/]data[\\/]reachability[\\/].*\.json$/.test(f))) {
  const size = gz(await readFile(f));
  if (size > BUDGET.reachabilityGzip) failures.push(`${path.relative(DIST, f)} ${kb(size)} gzip > ${kb(BUDGET.reachabilityGzip)}`);
}

const index = files.find((f) => /[\\/]data[\\/]index[\\/]destinations\.json$/.test(f));
if (!index) failures.push('data/index/destinations.json ontbreekt');
else {
  const size = gz(await readFile(index));
  console.log(`[budget] destinations index: ${kb(size)} gzip`);
  if (size > BUDGET.destinationsIndexGzip) failures.push(`destinations index ${kb(size)} gzip > ${kb(BUDGET.destinationsIndexGzip)}`);
}

const home = await readFile(path.join(DIST, 'index.html'), 'utf8');
const scripts = [...home.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]!);
let js = 0;
for (const src of scripts) {
  const rel = src.replace(/^https?:\/\/[^/]+/, '').replace(/^\/[^/]+\.nl\//, '/').replace(/^\//, '');
  try {
    js += (await stat(path.join(DIST, rel))).size;
  } catch {
    failures.push(`homepage script niet gevonden in dist: ${src}`);
  }
}
console.log(`[budget] homepage JS: ${kb(js)} (${scripts.length} bestanden)`);
if (js > BUDGET.homepageJs) failures.push(`homepage JS ${kb(js)} > ${kb(BUDGET.homepageJs)}`);

if (failures.length) {
  console.error('[budget] FAIL\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('[budget] OK');
