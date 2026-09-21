import { transactions } from '@/data/mock';
// Public fictional data only. Add server authorization before using any real feed.
export function GET() {
  const csv = [
    'Date,Address,Status,Side,Volume',
    ...transactions.map(
      (t) => `${t.date},"${t.address.replaceAll('"', '""')}",${t.status},${t.side},${t.price}`,
    ),
  ].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bluebase-demo-production-2026.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
