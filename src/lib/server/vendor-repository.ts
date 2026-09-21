import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID, createHash, randomBytes } from 'node:crypto';
import { companySeeds, categoryNames, categoryId, marketSeeds } from '../vendors/seeds';
import type {
  DirectoryVendor,
  DirectoryReview,
  DirectorySnapshot,
  DirectoryRules,
  Taxonomy,
  RecommendationReceipt,
} from '../vendors/types';
import {
  DirectoryError,
  normalizedName,
  validateRecommendation,
  validateReview,
} from '../vendors/validation';
import { queueRecommendationNotice } from './vendor-notifications';
type Row = Record<string, string | number | null>;
export function addMonths(date: string, months: number) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString();
}
export function initializeDirectory(db: DatabaseSync, now = new Date().toISOString()) {
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  db.exec(readFileSync(join(process.cwd(), 'db/migrations/001_vendor_directory.sql'), 'utf8'));
  if (db.prepare('SELECT id FROM vendors LIMIT 1').get()) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('INSERT OR IGNORE INTO directory_agents VALUES (?,?,?,?,?)').run(
      'agent-alexis',
      'Alexis Oakes',
      'Coldwell Banker Select',
      'agent',
      1,
    );
    db.prepare('INSERT OR IGNORE INTO directory_agents VALUES (?,?,?,?,?)').run(
      'demo-admin',
      'Sample administrator',
      'BlueBase demo',
      'admin',
      1,
    );
    for (let i = 0; i < 18; i++)
      db.prepare('INSERT OR IGNORE INTO directory_agents VALUES (?,?,?,?,?)').run(
        `sample-agent-${i}`,
        `Sample agent ${i + 1}`,
        i % 2 ? 'Coldwell Banker Plaza' : 'Coldwell Banker Select',
        'agent',
        1,
      );
    for (const name of categoryNames)
      db.prepare('INSERT OR IGNORE INTO categories VALUES (?,?,1)').run(categoryId(name), name);
    for (const m of marketSeeds)
      db.prepare('INSERT OR IGNORE INTO service_areas VALUES (?,?,?,1)').run(
        m.id,
        m.name,
        m.id === 'other' ? 1 : 0,
      );
    for (const id of ['a', 'b', 'c'])
      db.prepare('INSERT OR IGNORE INTO charities VALUES (?,?,NULL,NULL,1,1)').run(
        `sample-charity-${id}`,
        `Sample charity ${id.toUpperCase()}`,
      );
    for (const [i, v] of companySeeds.entries()) {
      db.prepare(
        `INSERT INTO vendors (id,name,normalized_name,initials,tone,description,services_json,website,source_url,source_checked_at,status,referring_agent_id,approved_at,invited_at,onboarded_at,member_since,sample) VALUES(?,?,?,?,?,?,?,?,?,?,'active',?,?,?,?,?,1)`,
      ).run(
        v.id,
        v.name,
        normalizedName(v.name),
        v.initials,
        v.tone,
        v.description,
        JSON.stringify(v.services),
        v.website,
        v.website,
        '2026-09-21',
        'sample-agent-0',
        now,
        now,
        now,
        now,
      );
      db.prepare(
        'INSERT INTO vendor_contacts(id,vendor_id,name,phone,email) VALUES(?,?,?,?,?)',
      ).run(`contact-${v.id}`, v.id, v.contactName, v.phone, v.email);
      for (const name of v.categories)
        db.prepare('INSERT INTO vendor_categories VALUES(?,?)').run(v.id, categoryId(name));
      for (const area of v.markets)
        db.prepare('INSERT INTO vendor_service_areas VALUES(?,?,?)').run(
          v.id,
          area,
          area === 'other' ? v.other : '',
        );
      const contributionDate =
        v.id === 'achosa'
          ? addMonths(new Date(new Date(now).getTime() + 20 * 86400000).toISOString(), -12)
          : now;
      db.prepare(
        `INSERT INTO vendor_contributions VALUES(?,?,?,?,?,?,'verified','demo-admin',?,1)`,
      ).run(
        `contrib-${v.id}`,
        v.id,
        `sample-charity-${['a', 'b', 'c'][i % 3]}`,
        200,
        contributionDate,
        addMonths(contributionDate, 12),
        'SAMPLE ONLY — no real charitable contribution or verification',
      );
      for (const [j, rating] of v.scores.entries())
        db.prepare('INSERT INTO vendor_reviews VALUES(?,?,?,?,?,?,?,?,1)').run(
          `sample-review-${v.id}-${j}`,
          `sample-agent-${j}`,
          v.id,
          rating,
          j % 2 ? 'client' : 'agent',
          j < 2
            ? 'Sample review for the demo. This is not a real endorsement of this company.'
            : '',
          now,
          now,
        );
      db.prepare(
        'INSERT INTO vendor_status_history(vendor_id,old_status,new_status,reason,recorded_at) VALUES(?,NULL,?,?,?)',
      ).run(v.id, 'active', 'Seeded sample membership; not an actual approval', now);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
let connection: DatabaseSync | undefined;
export function directoryDb() {
  if (process.env.VERCEL || process.env.BLUEBASE_VENDOR_STORAGE === 'disabled')
    throw new DirectoryError(
      'The persistent Vendor List database is not connected on this host. Run the local demo or connect a durable database.',
      503,
    );
  if (!connection) {
    const path =
      process.env.BLUEBASE_VENDOR_DB_PATH || join(process.cwd(), '.data/vendor-directory.sqlite');
    mkdirSync(dirname(path), { recursive: true });
    connection = new DatabaseSync(path);
    initializeDirectory(connection);
  }
  return connection;
}
export class VendorRepository {
  constructor(
    public db: DatabaseSync,
    public now = () => new Date().toISOString(),
  ) {}
  rules(): DirectoryRules {
    const r = this.db.prepare('SELECT * FROM vendor_settings WHERE id=1').get() as Row;
    return {
      minimumRating: Number(r.minimum_rating),
      annualContribution: Number(r.annual_contribution),
      renewalMonths: Number(r.renewal_months),
      renewalNoticeDays: Number(r.renewal_notice_days),
    };
  }
  taxonomy(table: 'categories' | 'service_areas'): Taxonomy[] {
    return this.db
      .prepare(`SELECT id,name FROM ${table} WHERE active=1 ORDER BY rowid`)
      .all() as unknown as Taxonomy[];
  }
  assertAgent(agentId: string) {
    const a = this.db
      .prepare("SELECT id FROM directory_agents WHERE id=? AND role='agent'")
      .get(agentId);
    if (!a) throw new DirectoryError('Please sign in as a BlueBase agent.', 401);
  }
  reconcile() {
    const rules = this.rules();
    const now = this.now();
    for (const v of this.db
      .prepare("SELECT * FROM vendors WHERE status IN ('active','renewal_due')")
      .all() as Row[]) {
      const avg = this.db
        .prepare('SELECT avg(rating) AS score FROM vendor_reviews WHERE vendor_id=?')
        .get(v.id!) as Row;
      let status = String(v.status),
        reason = '';
      const candidates = this.db
        .prepare(
          `SELECT c.* FROM vendor_contributions c JOIN charities h ON h.id=c.charity_id WHERE c.vendor_id=? AND c.verification_status='verified' AND c.verified_by IS NOT NULL AND c.amount>=? AND c.contribution_date<=? AND c.renewal_date>? AND h.active=1 ORDER BY c.renewal_date DESC`,
        )
        .all(v.id!, rules.annualContribution, now, now) as Row[];
      const contribution = candidates
        .map((c) => {
          const cap = addMonths(String(c.contribution_date), rules.renewalMonths);
          return {
            ...c,
            renewal_date: String(c.renewal_date) < cap ? String(c.renewal_date) : cap,
          };
        })
        .filter((c) => c.renewal_date > now)
        .sort((a, b) => b.renewal_date.localeCompare(a.renewal_date))[0];
      if (avg.score !== null && Number(avg.score) < rules.minimumRating) {
        status = 'suspended';
        reason = 'BlueBase rating below configured minimum';
      } else if (!v.approved_at || !v.invited_at || !v.onboarded_at) {
        status = 'under_review';
        reason = 'Approval, invitation and onboarding are required';
      } else if (!contribution) {
        status = 'expired';
        reason = 'No current verified qualifying charity contribution';
      } else {
        const due =
          new Date(String(contribution.renewal_date)).getTime() - new Date(now).getTime() <=
          rules.renewalNoticeDays * 86400000;
        status = due ? 'renewal_due' : 'active';
        reason = due ? 'Annual contribution renewal approaching' : 'Eligibility checked';
      }
      if (status !== v.status)
        this.db
          .prepare('UPDATE vendors SET status=?,status_reason=? WHERE id=?')
          .run(status, reason, v.id!);
    }
  }
  private vendor(v: Row): DirectoryVendor {
    const reviews = (
      this.db
        .prepare(
          'SELECT r.*,a.name AS agent_name FROM vendor_reviews r JOIN directory_agents a ON a.id=r.agent_id WHERE vendor_id=? ORDER BY updated_at DESC,id',
        )
        .all(v.id!) as Row[]
    ).map((r): DirectoryReview => ({
      id: String(r.id),
      agentId: String(r.agent_id),
      agentName: String(r.agent_name),
      rating: Number(r.rating),
      experience: r.experience_type as 'agent' | 'client',
      comment: String(r.comment),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
      sample: !!r.sample,
    }));
    const contact = this.db
      .prepare('SELECT * FROM vendor_contacts WHERE vendor_id=? LIMIT 1')
      .get(v.id!) as Row | undefined;
    const c = this.db
      .prepare(
        "SELECT c.*,h.name FROM vendor_contributions c JOIN charities h ON h.id=c.charity_id WHERE vendor_id=? AND verification_status='verified' ORDER BY renewal_date DESC LIMIT 1",
      )
      .get(v.id!) as Row | undefined;
    return {
      id: String(v.id),
      name: String(v.name),
      initials: String(v.initials),
      logo: v.logo as string | null,
      tone: String(v.tone),
      description: String(v.description),
      services: JSON.parse(String(v.services_json)),
      website: String(v.website),
      phone: String(contact?.phone || ''),
      email: String(contact?.email || ''),
      contactName: String(contact?.name || ''),
      sourceUrl: String(v.source_url),
      sourceCheckedAt: String(v.source_checked_at),
      memberSince: String(v.member_since),
      sample: !!v.sample,
      status: v.status as DirectoryVendor['status'],
      categoryIds: (
        this.db
          .prepare('SELECT category_id FROM vendor_categories WHERE vendor_id=?')
          .all(v.id!) as Row[]
      ).map((r) => String(r.category_id)),
      markets: (
        this.db
          .prepare('SELECT area_id,detail FROM vendor_service_areas WHERE vendor_id=?')
          .all(v.id!) as Row[]
      ).map((r) => ({ id: String(r.area_id), detail: String(r.detail) })),
      reviews,
      rating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null,
      reviewCount: reviews.length,
      recommendationCount: Number(
        this.db
          .prepare(
            'SELECT count(DISTINCT agent_id) AS n FROM (SELECT referring_agent_id AS agent_id FROM vendors WHERE id=? UNION SELECT agent_id FROM vendor_recommendations WHERE linked_vendor_id=?)',
          )
          .get(v.id!, v.id!)?.n || 0,
      ),
      charity: c
        ? { name: String(c.name), renewalDate: String(c.renewal_date), sample: !!c.sample }
        : null,
    };
  }
  snapshot(agentId: string): DirectorySnapshot {
    this.assertAgent(agentId);
    this.reconcile();
    const vendors = (
      this.db
        .prepare("SELECT * FROM vendors WHERE status IN ('active','renewal_due') ORDER BY rowid")
        .all() as Row[]
    ).map((v) => this.vendor(v));
    const reviewedVendors = (
      this.db
        .prepare(
          "SELECT v.* FROM vendors v JOIN vendor_reviews r ON r.vendor_id=v.id WHERE r.agent_id=? AND v.status NOT IN ('active','renewal_due')",
        )
        .all(agentId) as Row[]
    ).map((v) => this.vendor(v));
    const recommendations = (
      this.db
        .prepare('SELECT * FROM vendor_recommendations WHERE agent_id=? ORDER BY submitted_at DESC')
        .all(agentId) as Row[]
    ).map((r) => ({
      id: String(r.id),
      companyName: String(r.company_name),
      submittedAt: String(r.submitted_at),
      status: r.status as 'pending',
      notificationStatus: 'awaiting_provider' as const,
      duplicate: false,
    }));
    return {
      vendors,
      reviewedVendors,
      categories: this.taxonomy('categories'),
      markets: this.taxonomy('service_areas'),
      rules: this.rules(),
      recommendations,
      mode: 'local-demo',
      agentId,
    };
  }
  recommend(agentId: string, input: unknown): RecommendationReceipt {
    this.assertAgent(agentId);
    const x = validateRecommendation(
      input,
      this.taxonomy('categories'),
      this.taxonomy('service_areas'),
    );
    const name = normalizedName(x.companyName);
    const existing = this.db.prepare('SELECT id FROM vendors WHERE normalized_name=?').get(name);
    if (existing)
      throw new DirectoryError(
        'This company is already in the Vendor List records. Please share a review instead, or contact the team if it is not currently visible.',
        409,
      );
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const duplicate = this.db
        .prepare('SELECT * FROM vendor_recommendations WHERE agent_id=? AND normalized_name=?')
        .get(agentId, name) as Row | undefined;
      if (duplicate) {
        this.db.exec('COMMIT');
        return {
          id: String(duplicate.id),
          companyName: String(duplicate.company_name),
          submittedAt: String(duplicate.submitted_at),
          status: 'pending',
          notificationStatus: 'awaiting_provider',
          duplicate: true,
        };
      }
      const id = randomUUID(),
        now = this.now();
      this.db
        .prepare(
          `INSERT INTO vendor_recommendations(id,agent_id,company_name,normalized_name,contact_name,email,phone,website,experience,reason,notes,submitted_at,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
        )
        .run(
          id,
          agentId,
          x.companyName,
          name,
          x.contactName,
          x.email,
          x.phone,
          x.website,
          x.experience,
          x.reason,
          x.notes,
          now,
        );
      for (const category of x.categoryIds)
        this.db.prepare('INSERT INTO recommendation_categories VALUES(?,?)').run(id, category);
      for (const market of x.marketIds)
        this.db
          .prepare('INSERT INTO recommendation_service_areas VALUES(?,?,?)')
          .run(id, market, market === 'other' ? x.otherMarket : '');
      queueRecommendationNotice(this.db, {
        id,
        agentId,
        companyName: x.companyName,
        submittedAt: now,
      });
      this.db.exec('COMMIT');
      return {
        id,
        companyName: x.companyName,
        submittedAt: now,
        status: 'pending',
        notificationStatus: 'awaiting_provider',
        duplicate: false,
      };
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  review(agentId: string, input: unknown) {
    this.assertAgent(agentId);
    const x = validateReview(input);
    this.reconcile();
    const v = this.db.prepare('SELECT status FROM vendors WHERE id=?').get(x.vendorId) as
      Row | undefined;
    const mine = this.db
      .prepare('SELECT id FROM vendor_reviews WHERE agent_id=? AND vendor_id=?')
      .get(agentId, x.vendorId);
    if (!v || (!['active', 'renewal_due'].includes(String(v.status)) && !mine))
      throw new DirectoryError('This vendor is not available for a new review.', 409);
    const now = this.now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db
        .prepare(
          `INSERT INTO vendor_reviews(id,agent_id,vendor_id,rating,experience_type,comment,created_at,updated_at,sample) VALUES(?,?,?,?,?,?,?,?,1) ON CONFLICT(agent_id,vendor_id) DO UPDATE SET rating=excluded.rating,experience_type=excluded.experience_type,comment=excluded.comment,updated_at=excluded.updated_at`,
        )
        .run(randomUUID(), agentId, x.vendorId, x.rating, x.experience, x.comment, now, now);
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
    return {
      suspended:
        this.db.prepare('SELECT status FROM vendors WHERE id=?').get(x.vendorId)?.status ===
        'suspended',
    };
  }
}
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export function createDemoSession(db: DatabaseSync) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM directory_sessions WHERE expires_at<=?').run(new Date().toISOString());
  db.prepare('INSERT INTO directory_sessions VALUES(?,?,?)').run(
    digest(token),
    'agent-alexis',
    new Date(Date.now() + 86400000).toISOString(),
  );
  return token;
}
export function sessionAgent(db: DatabaseSync, token: string | undefined) {
  if (!token)
    throw new DirectoryError('Your demo session expired. Please reload the directory.', 401);
  const row = db
    .prepare('SELECT agent_id FROM directory_sessions WHERE token_hash=? AND expires_at>?')
    .get(digest(token), new Date().toISOString());
  if (!row)
    throw new DirectoryError('Your demo session expired. Please reload the directory.', 401);
  return String(row.agent_id);
}
export function revokeDemoSession(db: DatabaseSync, token: string | undefined) {
  if (token) db.prepare('DELETE FROM directory_sessions WHERE token_hash=?').run(digest(token));
}
