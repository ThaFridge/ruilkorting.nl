import type { Price } from './schemas/common.ts';

/** "1u20" / "45 min" style duration used on result cards. */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h}u` : `${h}u${String(rest).padStart(2, '0')}`;
}

const nlDate = new Intl.DateTimeFormat('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
const nlDateLong = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

/** "za 10 okt" — used for freshness labels (UX_GUIDELINES.md). */
export function formatDateShort(iso: string): string {
  return nlDate.format(new Date(iso)).replace('.', '');
}

export function formatDateLong(iso: string): string {
  return nlDateLong.format(new Date(iso));
}

const eurWhole = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const eurCents = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "€ 20" for whole amounts, "€ 12,50" otherwise. */
export function formatEuro(amount: number): string {
  return Number.isInteger(amount) ? eurWhole.format(amount) : eurCents.format(amount);
}

/** Price label that never pretends to be live (DATA_MODEL.md). */
export function priceLabel(price: Price | undefined): { text: string; detail: string | null } {
  if (!price || price.price_type === 'unavailable' || price.amount === undefined) {
    return { text: 'Prijs volgt', detail: price?.note ?? null };
  }
  const amount = formatEuro(price.amount);
  const detail = price.retrieved_at ? `prijs van ${formatDateShort(price.retrieved_at)}` : null;
  switch (price.price_type) {
    case 'from_price':
      return { text: `vanaf ${amount}`, detail };
    case 'promotional':
      return { text: `${amount} (actie)`, detail };
    case 'estimated':
      return { text: `ca. ${amount}`, detail: 'schatting' };
    case 'affiliate':
    case 'fixed':
    default:
      return { text: amount, detail };
  }
}
