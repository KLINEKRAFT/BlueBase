import { directoryDb, VendorRepository } from '../src/lib/server/vendor-repository';
const db = directoryDb();
new VendorRepository(db).reconcile();
console.log('Vendor rules', new VendorRepository(db).rules());
console.table(db.prepare('SELECT id,name,status,status_reason FROM vendors').all());
console.table(
  db
    .prepare(
      'SELECT id,company_name,agent_id,status,submitted_at FROM vendor_recommendations ORDER BY submitted_at DESC',
    )
    .all(),
);
console.table(
  db
    .prepare(
      'SELECT event_type,entity_id,recipient,status,created_at FROM notification_outbox ORDER BY created_at DESC',
    )
    .all(),
);
console.table(
  db
    .prepare(
      'SELECT vendor_id,old_status,new_status,reason,recorded_at FROM vendor_status_history ORDER BY id DESC LIMIT 20',
    )
    .all(),
);
