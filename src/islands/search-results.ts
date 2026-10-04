/**
 * Search island (ARCHITECTURE.md "Search"). Loads the destination index and exactly one
 * reachability file for the chosen departure station, then filters and sorts in the browser.
 * No provider calls; only same-site static JSON.
 */
import type { DestinationIndex, DestinationIndexItem } from '../lib/data/index-types.ts';
import { formatDateShort, formatEuro, formatMinutes } from '../lib/format.ts';
import type { ReachabilityFile, ReachabilityItem } from '../lib/schemas/reachability.ts';
import { bestOutingScore } from '../lib/scoring.ts';
import { parseIsoDate } from '../lib/season.ts';
import { SORT_MODES, type SortMode } from '../lib/site.ts';
import { PLANNER_URL, withBase } from '../lib/url.ts';

type Query = {
  van: string | null;
  datum: Date | null;
  budget: number | null;
  categorie: string | null;
  maxreistijd: number | null;
  sorteer: SortMode;
};

type Result = { d: DestinationIndexItem; r: ReachabilityItem; score: number; seasonMatch: boolean };

export function parseQuery(search: string): Query {
  const p = new URLSearchParams(search);
  const num = (k: string) => {
    const v = Number(p.get(k));
    return p.get(k) && Number.isFinite(v) && v > 0 ? v : null;
  };
  const sort = p.get('sorteer');
  return {
    van: p.get('van') || null,
    datum: parseIsoDate(p.get('datum')),
    budget: num('budget'),
    categorie: p.get('categorie') || null,
    maxreistijd: num('maxreistijd'),
    sorteer: SORT_MODES.includes(sort as SortMode) ? (sort as SortMode) : 'beste',
  };
}

export function buildResults(index: DestinationIndex, reach: ReachabilityFile, q: Query): Result[] {
  const month = (q.datum ?? new Date()).getMonth() + 1;
  const byDest = new Map(reach.items.map((i) => [i.destination, i]));
  const out: Result[] = [];
  for (const d of index.items) {
    const r = byDest.get(d.id);
    if (!r) continue;
    if (q.categorie && !d.categories.includes(q.categorie)) continue;
    if (q.maxreistijd && r.travel_minutes > q.maxreistijd) continue;
    // Budget only filters destinations with a known price; unknown prices stay visible and labelled.
    if (q.budget && d.price?.amount != null && d.price.amount > q.budget) continue;
    const seasonMatch = d.seasons.some((s) => index.seasons[s]?.months.includes(month));
    const score = bestOutingScore({
      travelMinutes: r.travel_minutes,
      featured: d.featured,
      seasonMatch,
      confidence: r.confidence,
      priceEuro: d.price?.amount ?? null,
      budgetEuro: q.budget,
    });
    out.push({ d, r, score, seasonMatch });
  }
  const cmp: Record<SortMode, (a: Result, b: Result) => number> = {
    beste: (a, b) => b.score - a.score || a.r.travel_minutes - b.r.travel_minutes,
    snelste: (a, b) => a.r.travel_minutes - b.r.travel_minutes || b.score - a.score,
    goedkoopste: (a, b) => (a.d.price?.amount ?? Infinity) - (b.d.price?.amount ?? Infinity) || b.score - a.score,
  };
  return out.sort(cmp[q.sorteer]);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function sortLink(q: Query, mode: SortMode, label: string): string {
  const p = new URLSearchParams(location.search);
  p.set('sorteer', mode);
  const active = q.sorteer === mode;
  return `<a href="?${p.toString()}" class="rounded-full px-3 py-1 text-sm font-medium ${active ? 'bg-rail-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" ${active ? 'aria-current="true"' : ''}>${label}</a>`;
}

function card(res: Result, index: DestinationIndex, stationName: string, estimated: boolean): string {
  const { d, r } = res;
  const price = d.price?.amount != null ? `${d.price.type === 'from_price' ? 'vanaf ' : ''}${formatEuro(d.price.amount)}` : 'Prijs volgt';
  const priceDetail = d.price?.retrieved_at ? ` · prijs van ${formatDateShort(d.price.retrieved_at)}` : '';
  const lastMile = `${d.last_mile.minutes} min ${d.last_mile.mode === 'walk' ? 'lopen' : esc(d.last_mile.mode)}`;
  const cats = d.categories.map((c) => `<li class="chip">${esc(index.categories[c] ?? c)}</li>`).join('');
  return `<article class="card flex flex-col gap-2">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-lg font-semibold leading-tight"><a class="hover:text-rail-700" href="${withBase(`/bestemmingen/${d.id}/`)}">${esc(d.title)}</a></h2>
      <span class="shrink-0 text-right"><span class="block text-lg font-bold">${estimated ? 'ca. ' : ''}${formatMinutes(r.travel_minutes)}</span><span class="text-xs text-slate-500">${r.transfers == null ? 'overstappen onbekend' : `${r.transfers} overstap${r.transfers === 1 ? '' : 'pen'}`}</span></span>
    </div>
    <p class="text-sm text-slate-600">${esc(d.city)} · ${esc(d.type)}${res.seasonMatch ? ' · <span class="text-emerald-700">past bij het seizoen</span>' : ''}${d.featured ? ' · <span class="text-amber-800">Tip</span>' : ''}</p>
    <p class="text-sm text-slate-700">${esc(d.summary)}</p>
    <p class="text-sm"><span class="text-slate-500">Route:</span> trein naar ${esc(stationName)}, dan ${lastMile}. <span class="text-slate-500">Prijs:</span> ${price}${priceDetail}</p>
    <ul class="flex flex-wrap gap-1">${cats}</ul>
  </article>`;
}

export async function mountSearchResults(root: HTMLElement): Promise<void> {
  const q = parseQuery(location.search);
  if (!q.van) {
    root.innerHTML = `<p class="rounded-lg bg-amber-50 p-3 text-amber-900">Kies eerst een vertrekstation.</p>`;
    (document.getElementById('zoekformulier') as HTMLDetailsElement | null)?.setAttribute('open', '');
    return;
  }
  try {
    const [index, reach] = await Promise.all([
      fetch(withBase('/data/index/destinations.json')).then((r) => (r.ok ? (r.json() as Promise<DestinationIndex>) : Promise.reject(new Error(`index ${r.status}`)))),
      fetch(withBase(`/data/reachability/${encodeURIComponent(q.van)}.json`)).then((r) =>
        r.ok ? (r.json() as Promise<ReachabilityFile>) : Promise.reject(new Error(`station ${r.status}`)),
      ),
    ]);
    const stationsIndex = await fetch(withBase('/data/index/stations.json')).then((r) => r.json() as Promise<{ items: { id: string; name: string }[] }>);
    const stationName = new Map(stationsIndex.items.map((s) => [s.id, s.name]));
    const results = buildResults(index, reach, q);
    const estimated = reach.source.startsWith('estimate');
    const from = stationName.get(reach.station) ?? reach.station;
    const header = `<div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-slate-700"><strong>${results.length}</strong> uitje${results.length === 1 ? '' : 's'} vanuit <strong>${esc(from)}</strong>${q.datum ? ` op ${formatDateShort(q.datum.toISOString())}` : ''}</p>
        <nav aria-label="Sorteren" class="flex gap-2">${sortLink(q, 'beste', 'Beste uitje')}${sortLink(q, 'snelste', 'Kortste reistijd')}${sortLink(q, 'goedkoopste', 'Goedkoopste')}</nav>
      </div>
      <p class="mt-2 text-sm text-slate-500"><span aria-hidden="true">🕒</span> reistijd ${estimated ? 'geschat' : 'berekend'} voor ${formatDateShort(reach.travel_date)} · gegevens van ${formatDateShort(reach.generated_at)}${estimated ? ' · schatting op basis van afstand, nog zonder dienstregeling' : ''} · <a class="underline" rel="noopener" target="_blank" href="${PLANNER_URL}">plan je werkelijke reis</a></p>`;
    const list = results.length
      ? `<div class="mt-4 grid gap-4 sm:grid-cols-2">${results.map((r) => card(r, index, stationName.get(r.d.station) ?? r.d.station, estimated)).join('')}</div>`
      : `<p class="mt-4 rounded-lg bg-slate-50 p-4 text-slate-700">Geen uitjes gevonden binnen deze filters. Verruim de reistijd of kies een andere categorie.</p>`;
    root.innerHTML = header + list;
  } catch (err) {
    root.innerHTML = `<p class="rounded-lg bg-red-50 p-3 text-red-900">De zoekgegevens konden niet worden geladen (${esc(String((err as Error).message))}). Probeer het later opnieuw.</p>`;
  }
}
