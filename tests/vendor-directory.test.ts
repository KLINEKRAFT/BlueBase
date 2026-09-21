import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import {
  initializeDirectory,
  VendorRepository,
  addMonths,
  createDemoSession,
  sessionAgent,
  revokeDemoSession,
} from '../src/lib/server/vendor-repository';
import { sameOrigin } from '../src/lib/server/request-origin';
const now = '2026-09-21T12:00:00.000Z';
function fixture() {
  const db = new DatabaseSync(':memory:');
  initializeDirectory(db, now);
  return { db, repo: new VendorRepository(db, () => now) };
}
const input = {
  companyName: 'Sample QA Company',
  contactName: 'Sample Contact',
  email: 'sample@example.com',
  phone: '9185550100',
  website: 'https://example.com',
  categoryIds: ['plumber', 'hvac'],
  marketIds: ['tulsa', 'other'],
  otherMarket: 'Sample region',
  experience: 'Sample prior experience',
  reason: 'Sample reason',
  notes: '',
};
test('five sourced companies, configurable taxonomy, unrated and renewal states', () => {
  const { db, repo } = fixture();
  try {
    const s = repo.snapshot('agent-alexis');
    assert.equal(s.vendors.length, 5);
    assert.equal(s.categories.length, 38);
    assert.equal(s.vendors.find((v) => v.id === 'first-american')?.rating, null);
    assert.equal(s.vendors.find((v) => v.id === 'achosa')?.status, 'renewal_due');
    assert.equal(s.rules.minimumRating, 4);
    assert.ok(s.vendors.every((v) => v.sample && v.reviews.every((r) => r.sample)));
  } finally {
    db.close();
  }
});
test('recommendation persists agent, multi-taxonomy and one transactional outbox notice; retries are idempotent', () => {
  const { db, repo } = fixture();
  try {
    const receipt = repo.recommend('agent-alexis', input);
    assert.equal(receipt.status, 'pending');
    assert.equal(repo.recommend('agent-alexis', input).id, receipt.id);
    assert.equal(repo.recommend('agent-alexis', input).duplicate, true);
    assert.equal(db.prepare('SELECT count(*) n FROM notification_outbox').get()?.n, 1);
    assert.equal(db.prepare('SELECT count(*) n FROM recommendation_categories').get()?.n, 2);
    assert.equal(repo.snapshot('agent-alexis').recommendations.length, 1);
    assert.throws(() => repo.recommend('stranger', input));
    assert.throws(() => repo.recommend('agent-alexis', { ...input, companyName: 'AMC Mortgage' }));
  } finally {
    db.close();
  }
});
test('recommendation validates required other market, categories and safe contact URLs', () => {
  const { db, repo } = fixture();
  try {
    for (const patch of [
      { otherMarket: '' },
      { categoryIds: ['unknown'] },
      { marketIds: [] },
      { website: 'javascript:alert(1)' },
      { email: 'bad' },
      { reason: '' },
    ])
      assert.throws(() => repo.recommend('agent-alexis', { ...input, ...patch }));
    assert.equal(repo.snapshot('agent-alexis').recommendations.length, 0);
  } finally {
    db.close();
  }
});
test('one current rating, 4.0 eligible, below threshold hidden, history retained and editable without auto-reinstatement', () => {
  const { db, repo } = fixture();
  try {
    const review = {
      vendorId: 'first-american',
      rating: 4,
      experience: 'client',
      comment: 'Sample test',
    };
    repo.review('agent-alexis', review);
    assert.ok(repo.snapshot('agent-alexis').vendors.some((v) => v.id === 'first-american'));
    assert.equal(repo.review('agent-alexis', { ...review, rating: 3 }).suspended, true);
    const s = repo.snapshot('agent-alexis');
    assert.equal(s.vendors.length, 4);
    assert.equal(s.reviewedVendors.length, 1);
    assert.equal(s.reviewedVendors[0].reviewCount, 1);
    assert.equal(db.prepare('SELECT count(*) n FROM vendor_review_history').get()?.n, 1);
    repo.review('agent-alexis', { ...review, rating: 5 });
    assert.equal(repo.snapshot('agent-alexis').vendors.length, 4);
    assert.throws(() => repo.review('sample-agent-0', review));
    assert.throws(() => repo.review('agent-alexis', { ...review, rating: 6 }));
    assert.throws(() => repo.review('demo-admin', review));
    assert.ok(
      Number(
        db
          .prepare("SELECT count(*) n FROM vendor_status_history WHERE new_status='suspended'")
          .get()?.n,
      ) > 0,
    );
  } finally {
    db.close();
  }
});
test('expired, unverified, insufficient, inactive charity and incomplete onboarding all hide vendors', () => {
  for (const sql of [
    "UPDATE vendor_contributions SET contribution_date='2019-01-01',renewal_date='2020-01-01'",
    "UPDATE vendor_contributions SET verification_status='pending'",
    'UPDATE vendor_contributions SET amount=199',
    'UPDATE charities SET active=0',
    'UPDATE vendors SET onboarded_at=NULL',
  ]) {
    const { db, repo } = fixture();
    try {
      db.exec(sql);
      assert.equal(repo.snapshot('agent-alexis').vendors.length, 0);
    } finally {
      db.close();
    }
  }
});
test('threshold and renewal interval changes take effect', () => {
  let { db, repo } = fixture();
  try {
    db.exec('UPDATE vendor_settings SET minimum_rating=5');
    assert.ok(
      repo.snapshot('agent-alexis').vendors.every((v) => v.rating === null || v.rating >= 5),
    );
  } finally {
    db.close();
  }
  ({ db, repo } = fixture());
  try {
    db.exec('UPDATE vendor_settings SET renewal_months=6');
    assert.ok(!repo.snapshot('agent-alexis').vendors.some((v) => v.id === 'achosa'));
  } finally {
    db.close();
  }
});
test('month boundary calculations and opaque expiring session identity', () => {
  assert.equal(addMonths('2024-02-29T00:00:00.000Z', 12), '2025-02-28T00:00:00.000Z');
  const { db } = fixture();
  try {
    const token = createDemoSession(db);
    assert.equal(sessionAgent(db, token), 'agent-alexis');
    assert.throws(() => sessionAgent(db, 'agent-alexis'));
    revokeDemoSession(db, token);
    assert.throws(() => sessionAgent(db, token));
  } finally {
    db.close();
  }
});
test('origin protection permits local host spelling but rejects cross-origin requests', () => {
  assert.ok(
    sameOrigin(
      new Request('http://localhost:3000', {
        headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000' },
      }),
    ),
  );
  assert.equal(
    sameOrigin(
      new Request('http://localhost:3000', {
        headers: { origin: 'https://evil.example', host: '127.0.0.1:3000' },
      }),
    ),
    false,
  );
});
