// Admin guard helper for Smart Files API routes.
// Mirrors the pattern in app/api/admin-verify/route.ts.

import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { getSingleRow } from '@/lib/db-utils';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperUser: boolean;
}

/**
 * Returns the authenticated admin user, or null if not authenticated.
 * Use this inside route handlers — does NOT return a Response.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    if (!sessionCookie?.value) return null;

    const tokenHash = createHash('sha256').update(sessionCookie.value).digest('hex');

    const result = await sql`
      SELECT s.id AS session_id, u.id, u.username, u.email,
             u.first_name, u.last_name, u.is_super_user
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash}
        AND s.user_type = 'admin'
        AND s.expires_at > NOW()
      LIMIT 1
    `;

    const row = getSingleRow(result);
    if (!row) return null;

    await sql`UPDATE user_sessions SET last_used_at = NOW() WHERE id = ${row.session_id}`;

    return {
      id: row.id as number,
      username: row.username as string,
      email: row.email as string,
      firstName: row.first_name as string,
      lastName: row.last_name as string,
      isSuperUser: !!(row.is_super_user),
    };
  } catch {
    return null;
  }
}

/**
 * Use this when you want to immediately return a 401 response if not admin.
 * Returns { admin } on success or { response } on failure.
 */
export async function requireAdmin(): Promise<
  { admin: AdminUser; response?: never } | { admin?: never; response: NextResponse }
> {
  const admin = await getAdminUser();
  if (!admin) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  return { admin };
}
