import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  monthly,
  transactions,
  wealth,
  contributions,
  goals,
  vendors,
  events,
  brokerOpens,
  achievements,
} from '../src/data/mock';
import { production } from '../src/lib/service';

test('monthly production, closed sides, GCI and wealth contributions reconcile', () => {
  const summary = production('YTD');
  const closed = transactions.filter((t) => t.status === 'Closed');
  assert.equal(summary.volume, 8400000);
  assert.equal(summary.units, 24);
  assert.equal(summary.gci, 210000);
  assert.equal(
    closed.reduce((n, t) => n + t.price, 0),
    summary.volume,
  );
  assert.equal(closed.length, summary.units);
  for (const [i, m] of monthly.entries()) {
    const rows = closed.filter((t) => Number(t.date.slice(5, 7)) === i + 1);
    assert.equal(
      rows.reduce((n, t) => n + t.price, 0),
      m.volume,
    );
    assert.equal(rows.length, m.units);
  }
  assert.equal(summary.buyerSides + summary.listingSides, summary.units);
  assert.equal(
    contributions.filter((c) => c.status === 'Confirmed').reduce((s, c) => s + c.amount, 0),
    wealth.confirmed,
  );
  assert.equal(
    contributions.filter((c) => c.status === 'Pending').reduce((s, c) => s + c.amount, 0),
    wealth.pending,
  );
  assert.equal(wealth.history.at(-1)?.balance, wealth.balance);
  assert.equal(wealth.balance, 47420 + wealth.ytd);
});
test('periods filter actuals while keeping the annual goal baseline independent', () => {
  assert.equal(production('Month').volume, 1455000);
  assert.equal(production('Month').units, 4);
  assert.equal(production('Quarter').volume, 3730000);
  assert.equal(production('Quarter').units, 10);
  assert.equal(production('YTD').volume / goals[0].target, 0.7);
  assert.equal(production('YTD').pendingVolume, 1580000);
  assert.equal(monthly.length, 12);
  assert.ok(monthly.slice(9).every((m) => m.projected && m.volume === 0));
});
test('discovery fixtures meet coverage and use distinct stable identities', () => {
  assert.ok(vendors.length >= 15);
  assert.ok(events.length >= 10);
  assert.ok(achievements.length >= 8);
  assert.ok(transactions.length >= 20);
  assert.equal(brokerOpens.length, 2);
  assert.ok(brokerOpens.every((e) => e.listings.length >= 5 && e.listings.length <= 8));
  for (const rows of [vendors, events, achievements, transactions])
    assert.equal(new Set(rows.map((x) => x.id)).size, rows.length);
  assert.ok(events.every((e) => e.date >= '2026-09-21'));
  assert.ok(vendors.every((v) => v.email.endsWith('.example')));
});

test('CSV export serves all fictional rows as an attachment', async () => {
  const { GET } = await import('../src/app/api/production-export/route');
  const response = GET();
  assert.equal(response.headers.get('Content-Type'), 'text/csv; charset=utf-8');
  assert.match(
    response.headers.get('Content-Disposition')!,
    /attachment; filename="bluebase-demo-production-2026.csv"/,
  );
  assert.equal((await response.text()).split('\r\n').length, transactions.length + 1);
});
