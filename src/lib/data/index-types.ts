/** Shapes of the prebuilt JSON indexes consumed by the search island. Keep small (ARCHITECTURE.md budgets). */
export type StationIndexItem = { id: string; name: string; major: boolean };
export type StationIndex = { generated_at: string; items: StationIndexItem[] };

export type DestinationIndexItem = {
  id: string;
  title: string;
  type: string;
  city: string;
  station: string;
  categories: string[];
  seasons: string[];
  summary: string;
  featured: boolean;
  /** Known price in euro, else null. Static builds never carry live prices. */
  price: { amount: number | null; type: string; retrieved_at: string | null } | null;
  last_mile: { mode: string; minutes: number };
};
export type DestinationIndex = {
  generated_at: string;
  categories: Record<string, string>;
  seasons: Record<string, { name: string; months: number[] }>;
  items: DestinationIndexItem[];
};
