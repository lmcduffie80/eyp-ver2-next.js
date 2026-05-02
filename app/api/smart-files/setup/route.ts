import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  let client: Awaited<ReturnType<typeof getConnection>> | undefined;
  try {
    client = await getConnection();

    // sf_files — root document
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_files (
        id               SERIAL PRIMARY KEY,
        owner_user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title            TEXT NOT NULL,
        status           TEXT NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','sent','partial','completed','cancelled')),
        theme            JSONB NOT NULL DEFAULT '{}'::jsonb,
        current_version  INTEGER NOT NULL DEFAULT 1,
        is_template      BOOLEAN NOT NULL DEFAULT FALSE,
        client_name      TEXT,
        client_email     TEXT,
        event_date       DATE,
        notes            TEXT,
        pdf_url          TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_pages — ordered pages within a file
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_pages (
        id          SERIAL PRIMARY KEY,
        file_id     INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        page_type   TEXT NOT NULL
                      CHECK (page_type IN ('cover','pricing','questionnaire','contract','invoice','payment')),
        title       TEXT NOT NULL,
        position    INTEGER NOT NULL DEFAULT 0,
        settings    JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_blocks — content blocks within a page
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_blocks (
        id          SERIAL PRIMARY KEY,
        page_id     INTEGER NOT NULL REFERENCES sf_pages(id) ON DELETE CASCADE,
        block_type  TEXT NOT NULL,
        content     JSONB NOT NULL DEFAULT '{}'::jsonb,
        position    INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_fields — key/value field tokens (e.g. project_name, venue)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_fields (
        id          SERIAL PRIMARY KEY,
        file_id     INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        key         TEXT NOT NULL,
        label       TEXT NOT NULL,
        value       TEXT,
        field_type  TEXT NOT NULL DEFAULT 'text'
                      CHECK (field_type IN ('text','date','email','phone','currency','select')),
        required    BOOLEAN NOT NULL DEFAULT FALSE,
        position    INTEGER NOT NULL DEFAULT 0,
        UNIQUE (file_id, key)
      )
    `);

    // sf_questionnaire_answers — client responses to questionnaire questions
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_questionnaire_answers (
        id           SERIAL PRIMARY KEY,
        file_id      INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        question_key TEXT NOT NULL,
        answer       JSONB NOT NULL DEFAULT 'null'::jsonb,
        updated_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (file_id, question_key)
      )
    `);

    // sf_signatures — per-role signature records
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_signatures (
        id                  SERIAL PRIMARY KEY,
        file_id             INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        signer_role         TEXT NOT NULL CHECK (signer_role IN ('provider','client')),
        signer_name         TEXT NOT NULL,
        signer_email        TEXT NOT NULL,
        status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','signed')),
        signature_png_url   TEXT,
        typed_name          TEXT,
        signed_at           TIMESTAMPTZ,
        ip                  TEXT,
        user_agent          TEXT,
        html_snapshot_hash  TEXT,
        UNIQUE (file_id, signer_role)
      )
    `);

    // sf_invoice_items — line items for the invoice page
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_invoice_items (
        id          SERIAL PRIMARY KEY,
        file_id     INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        qty         NUMERIC(10,2) NOT NULL DEFAULT 1,
        unit_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
        tax_rate    NUMERIC(5,4) NOT NULL DEFAULT 0,
        position    INTEGER NOT NULL DEFAULT 0
      )
    `);

    // sf_payment_schedule — payment installments
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_payment_schedule (
        id                      SERIAL PRIMARY KEY,
        file_id                 INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        label                   TEXT NOT NULL,
        amount_cents            INTEGER NOT NULL,
        due_date                DATE NOT NULL,
        status                  TEXT NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending','paid','overdue','refunded')),
        stripe_payment_intent_id TEXT,
        paid_at                 TIMESTAMPTZ
      )
    `);

    // sf_payments — actual payment records (immutable)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_payments (
        id               SERIAL PRIMARY KEY,
        file_id          INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        schedule_id      INTEGER REFERENCES sf_payment_schedule(id),
        amount_cents     INTEGER NOT NULL,
        method           TEXT NOT NULL DEFAULT 'card',
        stripe_charge_id TEXT,
        paid_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_share_tokens — tokenized client access links
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_share_tokens (
        id              SERIAL PRIMARY KEY,
        file_id         INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        token_hash      TEXT NOT NULL UNIQUE,
        recipient_email TEXT NOT NULL,
        expires_at      TIMESTAMPTZ NOT NULL,
        last_viewed_at  TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_audit_log — append-only event log
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_audit_log (
        id          SERIAL PRIMARY KEY,
        file_id     INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        actor_type  TEXT NOT NULL CHECK (actor_type IN ('admin','client','system')),
        actor_id    TEXT,
        event       TEXT NOT NULL,
        payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
        ip          TEXT,
        user_agent  TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_templates — saved reusable templates
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_templates (
        id             SERIAL PRIMARY KEY,
        name           TEXT NOT NULL,
        source_file_id INTEGER REFERENCES sf_files(id) ON DELETE SET NULL,
        category       TEXT,
        theme          JSONB NOT NULL DEFAULT '{}'::jsonb,
        structure      JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // sf_comments — block-level comment threads
    await client.query(`
      CREATE TABLE IF NOT EXISTS sf_comments (
        id          SERIAL PRIMARY KEY,
        file_id     INTEGER NOT NULL REFERENCES sf_files(id) ON DELETE CASCADE,
        block_id    INTEGER REFERENCES sf_blocks(id) ON DELETE SET NULL,
        author_type TEXT NOT NULL CHECK (author_type IN ('admin','client','system')),
        author_id   TEXT NOT NULL,
        body        TEXT NOT NULL,
        resolved    BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sf_files_owner    ON sf_files(owner_user_id);
      CREATE INDEX IF NOT EXISTS idx_sf_files_status   ON sf_files(status);
      CREATE INDEX IF NOT EXISTS idx_sf_pages_file     ON sf_pages(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_blocks_page    ON sf_blocks(page_id);
      CREATE INDEX IF NOT EXISTS idx_sf_fields_file    ON sf_fields(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_qa_file        ON sf_questionnaire_answers(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_sig_file       ON sf_signatures(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_inv_file       ON sf_invoice_items(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_sched_file     ON sf_payment_schedule(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_pay_file       ON sf_payments(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_tokens_hash    ON sf_share_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_sf_tokens_file    ON sf_share_tokens(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_audit_file     ON sf_audit_log(file_id);
      CREATE INDEX IF NOT EXISTS idx_sf_comments_file  ON sf_comments(file_id);
    `);

    return NextResponse.json({
      success: true,
      message: 'Smart Files schema created successfully',
      admin: admin.username,
    });
  } catch (error) {
    console.error('Smart Files setup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create Smart Files schema',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
