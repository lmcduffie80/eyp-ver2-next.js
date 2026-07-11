-- DJ project notification system
-- Tracks reminder/digest emails sent to DJs and their one-click confirmations.

CREATE TABLE IF NOT EXISTS dj_email_sends (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  dj_user TEXT NOT NULL,
  dj_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  resend_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digest sends have booking_id = NULL, so we need two separate unique constraints
-- (Postgres treats NULLs as distinct in unique indexes, so we split them.)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_dj_email_sends_booking
  ON dj_email_sends (booking_id, dj_user, email_type)
  WHERE booking_id IS NOT NULL;

-- Digest dedup is enforced at the application layer (dj-digest cron) because
-- Postgres won't accept sent_at::date in a unique-index predicate. A plain
-- btree index still speeds up the lookup path.
CREATE INDEX IF NOT EXISTS idx_dj_email_sends_digest_lookup
  ON dj_email_sends (dj_user, email_type, sent_at DESC)
  WHERE booking_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_dj_email_sends_sent_at
  ON dj_email_sends (sent_at DESC);

CREATE TABLE IF NOT EXISTS dj_confirmations (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  dj_user TEXT NOT NULL,
  dj_email TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_from_email_type TEXT,
  UNIQUE (booking_id, dj_user)
);

CREATE INDEX IF NOT EXISTS idx_dj_confirmations_booking
  ON dj_confirmations (booking_id);

-- One-shot alerts to Lee for bookings whose dj_user cannot be resolved to an email.
CREATE TABLE IF NOT EXISTS dj_email_admin_alerts (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  dj_user TEXT NOT NULL,
  reason TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (booking_id, reason)
);
