import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';

export interface DjRecord {
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// Load every DJ from the users table into a lookup keyed by (case-insensitive)
// username, first name, last name, and "First Last". This matches how
// bookings.dj_user is populated across the app (sometimes username, sometimes
// display name).
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
    if (dj.lastName) keys.add(dj.lastName.toLowerCase());
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

  // "Gavin McDuffie" -> try just "gavin", then just "mcduffie".
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    for (const part of parts) {
      const p = byKey.get(part);
      if (p) return p;
    }
  }

  return null;
}
