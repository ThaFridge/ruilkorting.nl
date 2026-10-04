import type { APIRoute, GetStaticPaths } from 'astro';
import { listReachabilityStations, readReachability } from '../../../lib/data/reachability.ts';

export const getStaticPaths: GetStaticPaths = async () =>
  (await listReachabilityStations()).map((station) => ({ params: { station } }));

export const GET: APIRoute = async ({ params }) => {
  const file = await readReachability(params.station!);
  return new Response(JSON.stringify(file), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
