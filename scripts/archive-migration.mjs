import sql from '../api-old/db/connection.js';

try {
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE`;
  console.log('Added archived column');
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ`;
  console.log('Added archived_at column');
  console.log('Archive migration complete!');
  process.exit(0);
} catch(e) {
  console.error('Migration error:', e.message);
  process.exit(1);
}
