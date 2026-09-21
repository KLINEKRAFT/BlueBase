import * as mock from '../data/mock';
import type { ProductionSummary } from './types';
export type Period = 'YTD' | 'Quarter' | 'Month';
// Replace this read boundary with API calls; the components consume the same types.
export const demoService = { getWorkspace: () => mock };
export function production(period: Period): ProductionSummary {
  const start = period === 'Month' ? 8 : period === 'Quarter' ? 6 : 0;
  const months = mock.monthly.slice(start, 9);
  const volume = months.reduce((a, m) => a + m.volume, 0),
    units = months.reduce((a, m) => a + m.units, 0);
  const active = mock.transactions.filter((t) => Number(t.date.slice(5, 7)) > start);
  const closed = active.filter((t) => t.status === 'Closed');
  const pending = active.filter((t) => t.status === 'Pending');
  return {
    volume,
    units,
    gci: months.reduce((a, m) => a + m.gci, 0),
    average: units ? volume / units : 0,
    pendingVolume: pending.reduce((a, t) => a + t.price, 0),
    pendingUnits: pending.length,
    listings: active.filter((t) => t.side === 'Listing').length,
    buyerSides: closed.filter((t) => t.side === 'Buyer').length,
    listingSides: closed.filter((t) => t.side === 'Listing').length,
    priorVolume: months.reduce((a, m) => a + m.prior, 0),
  };
}
export const money = (value: number, compact = false) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: compact ? 1 : 0,
    ...(compact ? { notation: 'compact' as const } : {}),
  }).format(value);
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
) => new Date(date + 'T12:00:00').toLocaleDateString('en-US', options);
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('bluebase:' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem('bluebase:' + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
