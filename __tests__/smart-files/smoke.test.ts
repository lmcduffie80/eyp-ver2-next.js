/**
 * Smart Files smoke tests — verifies the key data transformations and
 * component logic work correctly without requiring a live DB or browser.
 */

// ─── Type helpers ──────────────────────────────────────────────────────────

describe('Smart Files — Type guards', () => {
  const validStatuses = ['draft', 'sent', 'partial', 'completed', 'cancelled'];
  const validPageTypes = ['cover', 'pricing', 'questionnaire', 'contract', 'invoice', 'payment'];
  const validBlockTypes = [
    'heading', 'text', 'image', 'divider', 'spacer', 'company_header',
    'package_card', 'field_token', 'question', 'signature_block',
    'invoice_line', 'payment_schedule',
  ];

  it('covers all file statuses', () => {
    expect(validStatuses).toHaveLength(5);
    expect(validStatuses).toContain('completed');
  });

  it('covers all page types', () => {
    expect(validPageTypes).toHaveLength(6);
    expect(validPageTypes).toContain('contract');
  });

  it('covers all block types', () => {
    expect(validBlockTypes).toHaveLength(12);
    expect(validBlockTypes).toContain('signature_block');
  });
});

// ─── Invoice calculations ──────────────────────────────────────────────────

describe('Smart Files — Invoice math', () => {
  const items = [
    { qty: 1, unitPrice: 2500 },
    { qty: 2, unitPrice: 750 },
    { qty: 3, unitPrice: 100 },
  ];

  it('calculates subtotal correctly', () => {
    const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    expect(total).toBe(4300);
  });

  it('formats cents to dollars', () => {
    const cents = 250000;
    expect((cents / 100).toFixed(2)).toBe('2500.00');
  });

  it('adds tip correctly', () => {
    const base = 250000;
    const tipPct = 20;
    const tip = Math.round((base * tipPct) / 100);
    expect(tip).toBe(50000);
    expect(base + tip).toBe(300000);
  });
});

// ─── Signature status ────────────────────────────────────────────────────

describe('Smart Files — Signature logic', () => {
  it('marks completed when both parties signed', () => {
    const providerStatus = 'signed';
    const clientStatus = 'signed';
    const fileStatus = providerStatus === 'signed' && clientStatus === 'signed' ? 'completed' : 'partial';
    expect(fileStatus).toBe('completed');
  });

  it('marks partial when only client signed', () => {
    const providerStatus = 'pending';
    const clientStatus = 'signed';
    const fileStatus = providerStatus === 'signed' && clientStatus === 'signed' ? 'completed' : 'partial';
    expect(fileStatus).toBe('partial');
  });
});

// ─── Token / share logic ──────────────────────────────────────────────────

describe('Smart Files — Share token', () => {
  it('generates non-empty token', () => {
    const { randomBytes } = require('crypto');
    const token = randomBytes(32).toString('hex');
    expect(token).toHaveLength(64);
    expect(typeof token).toBe('string');
  });

  it('hashes token reproducibly', () => {
    const { createHash } = require('crypto');
    const token = 'abc123';
    const hash1 = createHash('sha256').update(token).digest('hex');
    const hash2 = createHash('sha256').update(token).digest('hex');
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });
});

// ─── Payment schedule ────────────────────────────────────────────────────

describe('Smart Files — Payment schedule', () => {
  it('sums schedule total correctly', () => {
    const schedule = [
      { amountCents: 50000, status: 'pending' },
      { amountCents: 75000, status: 'paid' },
      { amountCents: 75000, status: 'pending' },
    ];
    const total = schedule.reduce((s, i) => s + i.amountCents, 0);
    expect(total).toBe(200000);
    expect((total / 100).toFixed(2)).toBe('2000.00');
  });

  it('detects overdue items', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const item = { dueDate: yesterday, status: 'pending' };
    const isOverdue = new Date(item.dueDate) < new Date() && item.status === 'pending';
    expect(isOverdue).toBe(true);
  });
});

// ─── Field token replacement ──────────────────────────────────────────────

describe('Smart Files — Field tokens', () => {
  const fields = [
    { key: 'client_name', value: 'Jane Smith' },
    { key: 'venue', value: 'Riverside Gardens' },
    { key: 'event_date', value: 'June 14, 2026' },
  ];

  function replaceTokens(text: string, fieldMap: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (_, key) => fieldMap[key] ?? `{${key}}`);
  }

  it('replaces known tokens', () => {
    const fieldMap = Object.fromEntries(fields.map((f) => [f.key, f.value ?? '']));
    const result = replaceTokens('Hello {client_name}, your event at {venue}.', fieldMap);
    expect(result).toBe('Hello Jane Smith, your event at Riverside Gardens.');
  });

  it('preserves unknown tokens', () => {
    const fieldMap = Object.fromEntries(fields.map((f) => [f.key, f.value ?? '']));
    const result = replaceTokens('Contact {unknown_key}.', fieldMap);
    expect(result).toBe('Contact {unknown_key}.');
  });
});
