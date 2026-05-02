// ─── Smart Files – repository layer ──────────────────────────────────────────
// All DB access for Smart Files goes through here, using the existing sql helper.

import sql from '@/api-old/db/connection';
import { normalizeRows, getSingleRow } from '@/lib/db-utils';
import type {
  SmartFile,
  SfPage,
  SfBlock,
  SfField,
  SfSignature,
  SfInvoiceItem,
  SfPaymentSchedule,
  SfPayment,
  SfAuditEvent,
  SfQuestionnaireAnswer,
  SfShareToken,
  SfTheme,
  SfActorType,
  SfBlockContent,
  SfBlockType,
  SfPageType,
  SfFieldType,
  SmartFileDetail,
  SF_DEFAULT_THEME,
} from './types';
import { SF_DEFAULT_THEME as DEFAULT_THEME } from './types';

// ─── Mappers (snake_case DB → camelCase TS) ───────────────────────────────────

function mapFile(row: Record<string, unknown>): SmartFile {
  return {
    id: row.id as number,
    ownerUserId: row.owner_user_id as number,
    title: row.title as string,
    status: row.status as SmartFile['status'],
    theme: (typeof row.theme === 'string' ? JSON.parse(row.theme) : row.theme) as SfTheme ?? DEFAULT_THEME,
    currentVersion: row.current_version as number,
    isTemplate: row.is_template as boolean,
    clientName: row.client_name as string | undefined,
    clientEmail: row.client_email as string | undefined,
    eventDate: row.event_date ? String(row.event_date) : undefined,
    notes: row.notes as string | undefined,
    pdfUrl: row.pdf_url as string | undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapPage(row: Record<string, unknown>): SfPage {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    pageType: row.page_type as SfPageType,
    title: row.title as string,
    position: row.position as number,
    settings: (typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings ?? {}) as Record<string, unknown>,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapBlock(row: Record<string, unknown>): SfBlock {
  return {
    id: row.id as number,
    pageId: row.page_id as number,
    blockType: row.block_type as SfBlockType,
    content: (typeof row.content === 'string' ? JSON.parse(row.content) : row.content) as SfBlockContent,
    position: row.position as number,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapField(row: Record<string, unknown>): SfField {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    key: row.key as string,
    label: row.label as string,
    value: row.value as string | null,
    fieldType: row.field_type as SfFieldType,
    required: row.required as boolean,
    position: row.position as number,
  };
}

function mapSignature(row: Record<string, unknown>): SfSignature {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    signerRole: row.signer_role as SfSignature['signerRole'],
    signerName: row.signer_name as string,
    signerEmail: row.signer_email as string,
    status: row.status as SfSignature['status'],
    signaturePngUrl: row.signature_png_url as string | undefined,
    typedName: row.typed_name as string | undefined,
    signedAt: row.signed_at ? String(row.signed_at) : undefined,
    ip: row.ip as string | undefined,
    userAgent: row.user_agent as string | undefined,
    htmlSnapshotHash: row.html_snapshot_hash as string | undefined,
  };
}

function mapInvoiceItem(row: Record<string, unknown>): SfInvoiceItem {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    description: row.description as string,
    qty: Number(row.qty),
    unitPrice: Number(row.unit_price),
    taxRate: Number(row.tax_rate ?? 0),
    position: row.position as number,
  };
}

function mapPaymentSchedule(row: Record<string, unknown>): SfPaymentSchedule {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    label: row.label as string,
    amountCents: row.amount_cents as number,
    dueDate: String(row.due_date),
    status: row.status as SfPaymentSchedule['status'],
    stripePaymentIntentId: row.stripe_payment_intent_id as string | undefined,
    paidAt: row.paid_at ? String(row.paid_at) : undefined,
  };
}

function mapAuditEvent(row: Record<string, unknown>): SfAuditEvent {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    actorType: row.actor_type as SfActorType,
    actorId: row.actor_id as string | undefined,
    event: row.event as string,
    payload: (typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload ?? {}) as Record<string, unknown>,
    ip: row.ip as string | undefined,
    userAgent: row.user_agent as string | undefined,
    createdAt: String(row.created_at),
  };
}

function mapShareToken(row: Record<string, unknown>): SfShareToken {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    tokenHash: row.token_hash as string,
    recipientEmail: row.recipient_email as string,
    expiresAt: String(row.expires_at),
    lastViewedAt: row.last_viewed_at ? String(row.last_viewed_at) : undefined,
    createdAt: String(row.created_at),
  };
}

function mapQaAnswer(row: Record<string, unknown>): SfQuestionnaireAnswer {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    questionKey: row.question_key as string,
    answer: typeof row.answer === 'string' ? JSON.parse(row.answer) : row.answer,
    updatedAt: String(row.updated_at),
  };
}

// ─── Smart File CRUD ──────────────────────────────────────────────────────────

export async function listFiles(opts: {
  isTemplate?: boolean;
  status?: string;
  ownerId?: number;
  search?: string;
} = {}): Promise<SmartFile[]> {
  // Build incremental filters via raw query string (the sql helper is a template tag)
  // We do a simple approach: fetch all and filter in JS for now.
  // For production scale, parameterised WHERE would be better — fine for this dataset size.
  const result = await sql`
    SELECT * FROM sf_files
    WHERE (${ opts.isTemplate !== undefined ? (opts.isTemplate ? 'TRUE' : 'FALSE') : 'TRUE' } = TRUE OR is_template IS NOT NULL)
    ORDER BY updated_at DESC
  `;
  let rows = normalizeRows(result);

  if (opts.isTemplate !== undefined) {
    rows = rows.filter((r: Record<string, unknown>) => !!r.is_template === opts.isTemplate);
  }
  if (opts.status) {
    rows = rows.filter((r: Record<string, unknown>) => r.status === opts.status);
  }
  if (opts.ownerId !== undefined) {
    rows = rows.filter((r: Record<string, unknown>) => r.owner_user_id === opts.ownerId);
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((r: Record<string, unknown>) =>
      String(r.title ?? '').toLowerCase().includes(q) ||
      String(r.client_name ?? '').toLowerCase().includes(q)
    );
  }
  return rows.map(mapFile);
}

export async function getFileById(id: number): Promise<SmartFile | null> {
  const result = await sql`SELECT * FROM sf_files WHERE id = ${id} LIMIT 1`;
  const row = getSingleRow(result);
  return row ? mapFile(row) : null;
}

export async function createFile(data: {
  ownerUserId: number;
  title: string;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  notes?: string;
}): Promise<SmartFile> {
  const themeJson = JSON.stringify(DEFAULT_THEME);
  const result = await sql`
    INSERT INTO sf_files (owner_user_id, title, status, theme, current_version, is_template, client_name, client_email, event_date, notes)
    VALUES (
      ${data.ownerUserId}, ${data.title}, 'draft', ${themeJson}::jsonb,
      1, FALSE,
      ${data.clientName ?? null}, ${data.clientEmail ?? null},
      ${data.eventDate ?? null}, ${data.notes ?? null}
    )
    RETURNING *
  `;
  return mapFile(getSingleRow(result));
}

export async function updateFile(id: number, data: {
  title?: string;
  status?: string;
  theme?: Record<string, unknown>;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  notes?: string;
  pdfUrl?: string;
  isTemplate?: boolean;
}): Promise<SmartFile | null> {
  const existing = await getFileById(id);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const status = data.status ?? existing.status;
  const theme = JSON.stringify(data.theme ?? existing.theme);
  const clientName = 'clientName' in data ? (data.clientName ?? null) : (existing.clientName ?? null);
  const clientEmail = 'clientEmail' in data ? (data.clientEmail ?? null) : (existing.clientEmail ?? null);
  const eventDate = 'eventDate' in data ? (data.eventDate ?? null) : (existing.eventDate ?? null);
  const notes = 'notes' in data ? (data.notes ?? null) : (existing.notes ?? null);
  const pdfUrl = 'pdfUrl' in data ? (data.pdfUrl ?? null) : (existing.pdfUrl ?? null);
  const isTemplate = 'isTemplate' in data ? !!data.isTemplate : existing.isTemplate;

  const result = await sql`
    UPDATE sf_files SET
      title = ${title},
      status = ${status},
      theme = ${theme}::jsonb,
      client_name = ${clientName},
      client_email = ${clientEmail},
      event_date = ${eventDate},
      notes = ${notes},
      pdf_url = ${pdfUrl},
      is_template = ${isTemplate},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  const row = getSingleRow(result);
  return row ? mapFile(row) : null;
}

export async function deleteFile(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM sf_files WHERE id = ${id} RETURNING id`;
  return normalizeRows(result).length > 0;
}

// ─── Pages ────────────────────────────────────────────────────────────────────

export async function listPages(fileId: number): Promise<SfPage[]> {
  const result = await sql`
    SELECT * FROM sf_pages WHERE file_id = ${fileId} ORDER BY position ASC
  `;
  return normalizeRows(result).map(mapPage);
}

export async function getPageById(id: number): Promise<SfPage | null> {
  const result = await sql`SELECT * FROM sf_pages WHERE id = ${id} LIMIT 1`;
  const row = getSingleRow(result);
  return row ? mapPage(row) : null;
}

export async function createPage(data: {
  fileId: number;
  pageType: SfPageType;
  title?: string;
  position?: number;
  settings?: Record<string, unknown>;
}): Promise<SfPage> {
  const maxPosResult = await sql`
    SELECT COALESCE(MAX(position), -1) AS max_pos FROM sf_pages WHERE file_id = ${data.fileId}
  `;
  const maxPos = Number(getSingleRow(maxPosResult)?.max_pos ?? -1);
  const position = data.position ?? maxPos + 1;
  const title = data.title ?? pageTypeLabel(data.pageType);
  const settings = JSON.stringify(data.settings ?? {});

  const result = await sql`
    INSERT INTO sf_pages (file_id, page_type, title, position, settings)
    VALUES (${data.fileId}, ${data.pageType}, ${title}, ${position}, ${settings}::jsonb)
    RETURNING *
  `;
  return mapPage(getSingleRow(result));
}

export async function updatePage(id: number, data: {
  title?: string;
  position?: number;
  settings?: Record<string, unknown>;
}): Promise<SfPage | null> {
  const existing = await getPageById(id);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const position = data.position ?? existing.position;
  const settings = JSON.stringify(data.settings ?? existing.settings);

  const result = await sql`
    UPDATE sf_pages SET title = ${title}, position = ${position}, settings = ${settings}::jsonb, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  const row = getSingleRow(result);
  return row ? mapPage(row) : null;
}

export async function deletePage(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM sf_pages WHERE id = ${id} RETURNING id`;
  return normalizeRows(result).length > 0;
}

export async function reorderPages(items: Array<{ id: number; position: number }>): Promise<void> {
  for (const { id, position } of items) {
    await sql`UPDATE sf_pages SET position = ${position}, updated_at = NOW() WHERE id = ${id}`;
  }
}

// ─── Blocks ───────────────────────────────────────────────────────────────────

export async function listBlocks(pageId: number): Promise<SfBlock[]> {
  const result = await sql`
    SELECT * FROM sf_blocks WHERE page_id = ${pageId} ORDER BY position ASC
  `;
  return normalizeRows(result).map(mapBlock);
}

export async function getBlockById(id: number): Promise<SfBlock | null> {
  const result = await sql`SELECT * FROM sf_blocks WHERE id = ${id} LIMIT 1`;
  const row = getSingleRow(result);
  return row ? mapBlock(row) : null;
}

export async function createBlock(data: {
  pageId: number;
  blockType: SfBlockType;
  content: SfBlockContent;
  position?: number;
}): Promise<SfBlock> {
  const maxPosResult = await sql`
    SELECT COALESCE(MAX(position), -1) AS max_pos FROM sf_blocks WHERE page_id = ${data.pageId}
  `;
  const maxPos = Number(getSingleRow(maxPosResult)?.max_pos ?? -1);
  const position = data.position ?? maxPos + 1;
  const content = JSON.stringify(data.content);

  const result = await sql`
    INSERT INTO sf_blocks (page_id, block_type, content, position)
    VALUES (${data.pageId}, ${data.blockType}, ${content}::jsonb, ${position})
    RETURNING *
  `;
  return mapBlock(getSingleRow(result));
}

export async function updateBlock(id: number, data: {
  content?: SfBlockContent;
  position?: number;
}): Promise<SfBlock | null> {
  const existing = await getBlockById(id);
  if (!existing) return null;

  const content = JSON.stringify(data.content ?? existing.content);
  const position = data.position ?? existing.position;

  const result = await sql`
    UPDATE sf_blocks SET content = ${content}::jsonb, position = ${position}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  const row = getSingleRow(result);
  return row ? mapBlock(row) : null;
}

export async function deleteBlock(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM sf_blocks WHERE id = ${id} RETURNING id`;
  return normalizeRows(result).length > 0;
}

export async function reorderBlocks(items: Array<{ id: number; position: number }>): Promise<void> {
  for (const { id, position } of items) {
    await sql`UPDATE sf_blocks SET position = ${position}, updated_at = NOW() WHERE id = ${id}`;
  }
}

// ─── Fields ───────────────────────────────────────────────────────────────────

export async function listFields(fileId: number): Promise<SfField[]> {
  const result = await sql`
    SELECT * FROM sf_fields WHERE file_id = ${fileId} ORDER BY position ASC
  `;
  return normalizeRows(result).map(mapField);
}

export async function upsertField(fileId: number, data: {
  key: string;
  label: string;
  value?: string | null;
  fieldType?: SfFieldType;
  required?: boolean;
  position?: number;
}): Promise<SfField> {
  const fieldType = data.fieldType ?? 'text';
  const required = data.required ?? false;
  const value = data.value ?? null;

  const maxPosResult = await sql`
    SELECT COALESCE(MAX(position), -1) AS max_pos FROM sf_fields WHERE file_id = ${fileId}
  `;
  const maxPos = Number(getSingleRow(maxPosResult)?.max_pos ?? -1);
  const position = data.position ?? maxPos + 1;

  const result = await sql`
    INSERT INTO sf_fields (file_id, key, label, value, field_type, required, position)
    VALUES (${fileId}, ${data.key}, ${data.label}, ${value}, ${fieldType}, ${required}, ${position})
    ON CONFLICT (file_id, key) DO UPDATE SET
      label = EXCLUDED.label,
      value = EXCLUDED.value,
      field_type = EXCLUDED.field_type,
      required = EXCLUDED.required
    RETURNING *
  `;
  return mapField(getSingleRow(result));
}

export async function deleteField(fileId: number, key: string): Promise<boolean> {
  const result = await sql`DELETE FROM sf_fields WHERE file_id = ${fileId} AND key = ${key} RETURNING id`;
  return normalizeRows(result).length > 0;
}

// ─── Questionnaire Answers ────────────────────────────────────────────────────

export async function listAnswers(fileId: number): Promise<SfQuestionnaireAnswer[]> {
  const result = await sql`
    SELECT * FROM sf_questionnaire_answers WHERE file_id = ${fileId} ORDER BY id ASC
  `;
  return normalizeRows(result).map(mapQaAnswer);
}

export async function upsertAnswer(fileId: number, questionKey: string, answer: unknown): Promise<SfQuestionnaireAnswer> {
  const answerJson = JSON.stringify(answer);
  const result = await sql`
    INSERT INTO sf_questionnaire_answers (file_id, question_key, answer)
    VALUES (${fileId}, ${questionKey}, ${answerJson}::jsonb)
    ON CONFLICT (file_id, question_key) DO UPDATE SET
      answer = EXCLUDED.answer,
      updated_at = NOW()
    RETURNING *
  `;
  return mapQaAnswer(getSingleRow(result));
}

// ─── Signatures ───────────────────────────────────────────────────────────────

export async function listSignatures(fileId: number): Promise<SfSignature[]> {
  const result = await sql`SELECT * FROM sf_signatures WHERE file_id = ${fileId}`;
  return normalizeRows(result).map(mapSignature);
}

export async function upsertSignature(fileId: number, data: {
  signerRole: SfSignature['signerRole'];
  signerName: string;
  signerEmail: string;
  status?: SfSignature['status'];
  signaturePngUrl?: string;
  typedName?: string;
  ip?: string;
  userAgent?: string;
  htmlSnapshotHash?: string;
}): Promise<SfSignature> {
  const status = data.status ?? 'pending';
  const signedAt = status === 'signed' ? 'NOW()' : null;

  const result = await sql`
    INSERT INTO sf_signatures (file_id, signer_role, signer_name, signer_email, status, signature_png_url, typed_name, signed_at, ip, user_agent, html_snapshot_hash)
    VALUES (
      ${fileId}, ${data.signerRole}, ${data.signerName}, ${data.signerEmail}, ${status},
      ${data.signaturePngUrl ?? null}, ${data.typedName ?? null},
      ${status === 'signed' ? new Date().toISOString() : null},
      ${data.ip ?? null}, ${data.userAgent ?? null}, ${data.htmlSnapshotHash ?? null}
    )
    ON CONFLICT (file_id, signer_role) DO UPDATE SET
      signer_name = EXCLUDED.signer_name,
      signer_email = EXCLUDED.signer_email,
      status = EXCLUDED.status,
      signature_png_url = COALESCE(EXCLUDED.signature_png_url, sf_signatures.signature_png_url),
      typed_name = COALESCE(EXCLUDED.typed_name, sf_signatures.typed_name),
      signed_at = CASE WHEN EXCLUDED.status = 'signed' THEN COALESCE(sf_signatures.signed_at, NOW()) ELSE sf_signatures.signed_at END,
      ip = COALESCE(EXCLUDED.ip, sf_signatures.ip),
      user_agent = COALESCE(EXCLUDED.user_agent, sf_signatures.user_agent),
      html_snapshot_hash = COALESCE(EXCLUDED.html_snapshot_hash, sf_signatures.html_snapshot_hash)
    RETURNING *
  `;
  return mapSignature(getSingleRow(result));
}

// ─── Invoice Items ────────────────────────────────────────────────────────────

export async function listInvoiceItems(fileId: number): Promise<SfInvoiceItem[]> {
  const result = await sql`
    SELECT * FROM sf_invoice_items WHERE file_id = ${fileId} ORDER BY position ASC
  `;
  return normalizeRows(result).map(mapInvoiceItem);
}

export async function upsertInvoiceItem(fileId: number, data: {
  id?: number;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate?: number;
  position?: number;
}): Promise<SfInvoiceItem> {
  const maxPosResult = await sql`
    SELECT COALESCE(MAX(position), -1) AS max_pos FROM sf_invoice_items WHERE file_id = ${fileId}
  `;
  const maxPos = Number(getSingleRow(maxPosResult)?.max_pos ?? -1);
  const position = data.position ?? maxPos + 1;

  if (data.id) {
    const result = await sql`
      UPDATE sf_invoice_items SET
        description = ${data.description}, qty = ${data.qty},
        unit_price = ${data.unitPrice}, tax_rate = ${data.taxRate ?? 0},
        position = ${position}
      WHERE id = ${data.id} AND file_id = ${fileId}
      RETURNING *
    `;
    return mapInvoiceItem(getSingleRow(result));
  }

  const result = await sql`
    INSERT INTO sf_invoice_items (file_id, description, qty, unit_price, tax_rate, position)
    VALUES (${fileId}, ${data.description}, ${data.qty}, ${data.unitPrice}, ${data.taxRate ?? 0}, ${position})
    RETURNING *
  `;
  return mapInvoiceItem(getSingleRow(result));
}

export async function deleteInvoiceItem(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM sf_invoice_items WHERE id = ${id} RETURNING id`;
  return normalizeRows(result).length > 0;
}

// ─── Payment Schedule ─────────────────────────────────────────────────────────

export async function listPaymentSchedule(fileId: number): Promise<SfPaymentSchedule[]> {
  const result = await sql`
    SELECT * FROM sf_payment_schedule WHERE file_id = ${fileId} ORDER BY due_date ASC
  `;
  return normalizeRows(result).map(mapPaymentSchedule);
}

export async function upsertPaymentScheduleItem(fileId: number, data: {
  id?: number;
  label: string;
  amountCents: number;
  dueDate: string;
  status?: SfPaymentSchedule['status'];
}): Promise<SfPaymentSchedule> {
  const status = data.status ?? 'pending';
  if (data.id) {
    const result = await sql`
      UPDATE sf_payment_schedule SET
        label = ${data.label}, amount_cents = ${data.amountCents},
        due_date = ${data.dueDate}, status = ${status}
      WHERE id = ${data.id} AND file_id = ${fileId}
      RETURNING *
    `;
    return mapPaymentSchedule(getSingleRow(result));
  }
  const result = await sql`
    INSERT INTO sf_payment_schedule (file_id, label, amount_cents, due_date, status)
    VALUES (${fileId}, ${data.label}, ${data.amountCents}, ${data.dueDate}, ${status})
    RETURNING *
  `;
  return mapPaymentSchedule(getSingleRow(result));
}

export async function deletePaymentScheduleItem(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM sf_payment_schedule WHERE id = ${id} RETURNING id`;
  return normalizeRows(result).length > 0;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function appendAuditEvent(data: {
  fileId: number;
  actorType: SfActorType;
  actorId?: string;
  event: string;
  payload?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  const payload = JSON.stringify(data.payload ?? {});
  await sql`
    INSERT INTO sf_audit_log (file_id, actor_type, actor_id, event, payload, ip, user_agent)
    VALUES (
      ${data.fileId}, ${data.actorType}, ${data.actorId ?? null},
      ${data.event}, ${payload}::jsonb,
      ${data.ip ?? null}, ${data.userAgent ?? null}
    )
  `;
}

export async function listAuditEvents(fileId: number): Promise<SfAuditEvent[]> {
  const result = await sql`
    SELECT * FROM sf_audit_log WHERE file_id = ${fileId} ORDER BY created_at DESC
  `;
  return normalizeRows(result).map(mapAuditEvent);
}

// ─── Share Tokens ─────────────────────────────────────────────────────────────

export async function createShareToken(data: {
  fileId: number;
  tokenHash: string;
  recipientEmail: string;
  expiresAt: Date;
}): Promise<SfShareToken> {
  const result = await sql`
    INSERT INTO sf_share_tokens (file_id, token_hash, recipient_email, expires_at)
    VALUES (${data.fileId}, ${data.tokenHash}, ${data.recipientEmail}, ${data.expiresAt.toISOString()})
    RETURNING *
  `;
  return mapShareToken(getSingleRow(result));
}

export async function getShareTokenByHash(tokenHash: string): Promise<SfShareToken | null> {
  const result = await sql`
    SELECT * FROM sf_share_tokens
    WHERE token_hash = ${tokenHash} AND expires_at > NOW()
    LIMIT 1
  `;
  const row = getSingleRow(result);
  return row ? mapShareToken(row) : null;
}

export async function touchShareToken(tokenHash: string): Promise<void> {
  await sql`
    UPDATE sf_share_tokens SET last_viewed_at = NOW() WHERE token_hash = ${tokenHash}
  `;
}

export async function listShareTokens(fileId: number): Promise<SfShareToken[]> {
  const result = await sql`
    SELECT * FROM sf_share_tokens WHERE file_id = ${fileId} ORDER BY created_at DESC
  `;
  return normalizeRows(result).map(mapShareToken);
}

// ─── Full detail (for editor + viewer) ───────────────────────────────────────

export async function getFileDetail(id: number): Promise<SmartFileDetail | null> {
  const file = await getFileById(id);
  if (!file) return null;

  const pages = await listPages(id);
  const pagesWithBlocks = await Promise.all(
    pages.map(async (page) => ({
      ...page,
      blocks: await listBlocks(page.id),
    }))
  );

  const [fields, signatures, invoiceItems, paymentSchedule] = await Promise.all([
    listFields(id),
    listSignatures(id),
    listInvoiceItems(id),
    listPaymentSchedule(id),
  ]);

  return {
    ...file,
    pages: pagesWithBlocks,
    fields,
    signatures,
    invoiceItems,
    paymentSchedule,
  };
}

// ─── Clone file (for templates) ───────────────────────────────────────────────

export async function cloneFile(sourceId: number, opts: {
  ownerUserId: number;
  title: string;
  isTemplate?: boolean;
}): Promise<SmartFileDetail> {
  const source = await getFileDetail(sourceId);
  if (!source) throw new Error('Source file not found');

  const newFile = await createFile({
    ownerUserId: opts.ownerUserId,
    title: opts.title,
    clientName: source.clientName,
    clientEmail: source.clientEmail,
    eventDate: source.eventDate,
    notes: source.notes,
  });

  if (opts.isTemplate) {
    await updateFile(newFile.id, { isTemplate: true, theme: source.theme as unknown as Record<string, unknown> });
  } else {
    await updateFile(newFile.id, { theme: source.theme as unknown as Record<string, unknown> });
  }

  for (const page of source.pages) {
    const newPage = await createPage({
      fileId: newFile.id,
      pageType: page.pageType,
      title: page.title,
      position: page.position,
      settings: page.settings,
    });
    for (const block of page.blocks) {
      await createBlock({
        pageId: newPage.id,
        blockType: block.blockType,
        content: block.content,
        position: block.position,
      });
    }
  }

  for (const field of source.fields) {
    await upsertField(newFile.id, {
      key: field.key,
      label: field.label,
      fieldType: field.fieldType,
      required: field.required,
      position: field.position,
    });
  }

  return (await getFileDetail(newFile.id))!;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pageTypeLabel(type: SfPageType): string {
  const labels: Record<SfPageType, string> = {
    cover: 'Cover',
    pricing: 'Pricing',
    questionnaire: 'Questionnaire',
    contract: 'Contract',
    invoice: 'Invoice',
    payment: 'Payment',
  };
  return labels[type] ?? type;
}
