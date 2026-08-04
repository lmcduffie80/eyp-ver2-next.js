import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';

export interface DjRecord {
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// Load every DJ from the users table into a lookup keyed by (case-insensitive)
// username, first name, and "First Last". Last names are intentionally excluded
// as standalone keys because family members share them (e.g. "McDuffie" would
// ambiguously match multiple people). Username, first name, and full name are
// sufficient for all real-world dj_user values.
export async function loadDjLookup(): Promise<{
  byKey: Map<string, DjRecord>;
  all: DjRecord[];
}> {
  const rows = normalizeRows(await sql`
    SELECT username, email, first_name, last_name
    FROM users
    WHERE user_type = 'dj' AND email IS NOT NULL AND email <> ''
  `);

  const all: DjRecord[] = rows.map(r => ({
    username: r.username,
    email: r.email,
    firstName: r.first_name,
    lastName: r.last_name,
  }));

  const byKey = new Map<string, DjRecord>();
  for (const dj of all) {
    const keys = new Set<string>();
    if (dj.username) keys.add(dj.username.toLowerCase());
    if (dj.firstName) keys.add(dj.firstName.toLowerCase());
    if (dj.firstName && dj.lastName) {
      keys.add(`${dj.firstName} ${dj.lastName}`.toLowerCase());
    }
    for (const k of keys) {
      if (!byKey.has(k)) byKey.set(k, dj);
    }
  }

  return { byKey, all };
}

// Try to resolve a free-form dj_user value to a DJ record. Returns null when
// there is no match — the caller decides whether to alert Lee.
export function resolveDj(djUser: string | null | undefined, byKey: Map<string, DjRecord>): DjRecord | null {
  if (!djUser) return null;
  const trimmed = djUser.trim().toLowerCase();
  if (!trimmed) return null;

  // Exact match on any known variation first.
  const direct = byKey.get(trimmed);
  if (direct) return direct;

  // "Gavin McDuffie" stored as dj_user but only first name is indexed ->
  // try the first token only. Never try the last name: it is shared across
  // family members and would match the wrong person (e.g. "Lee McDuffie"
  // falling back to "mcduffie" → Gavin).
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    const firstToken = byKey.get(parts[0]);
    if (firstToken) return firstToken;
  }

  return null;
}
