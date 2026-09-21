import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
export interface NotificationMessage {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
}
export interface EmailTransport {
  send(message: NotificationMessage): Promise<{ providerId: string }>;
}
// No provider is configured. Persist the intent in the same transaction as the recommendation.
// A future authenticated worker should claim outbox rows and use an EmailTransport adapter.
export function queueRecommendationNotice(
  db: DatabaseSync,
  record: { id: string; agentId: string; companyName: string; submittedAt: string },
) {
  db.prepare(
    `INSERT INTO notification_outbox(id,event_type,entity_id,recipient,subject,payload_json,status,created_at) VALUES(?,'vendor_recommended',?,?,?,?,'awaiting_provider',?)`,
  ).run(
    randomUUID(),
    record.id,
    process.env.VENDOR_ADMIN_EMAIL || 'tiffanyv@cbtulsa.com',
    'BlueBase: vendor recommendation awaiting review',
    JSON.stringify(record),
    record.submittedAt,
  );
}
