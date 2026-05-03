import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { Resend } from 'resend';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET ?? ''}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  let overdueUpdated = 0;
  let remindersSent = 0;

  // Mark overdue payments
  const overdueResult = normalizeRows(await sql`
    UPDATE sf_payment_schedule SET status = 'overdue'
    WHERE status = 'pending' AND due_date < CURRENT_DATE
    RETURNING id
  `);
  overdueUpdated = overdueResult.length;

  // Files sent 3+ days ago still awaiting client signature
  const unsignedFiles = normalizeRows(await sql`
    SELECT f.id, f.title, f.client_email, f.client_name
    FROM sf_files f
    LEFT JOIN sf_signatures s ON s.file_id = f.id AND s.signer_role = 'client' AND s.status = 'signed'
    WHERE f.status IN ('sent', 'partial')
    AND s.id IS NULL
    AND f.updated_at < NOW() - INTERVAL '3 days'
  `);

  for (const file of unsignedFiles) {
    // Get a valid share token for this file
    const tokenRows = normalizeRows(await sql`SELECT token_hash, recipient_email FROM sf_share_tokens WHERE file_id = ${file.id} AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC LIMIT 1`);
    if (!tokenRows.length) continue;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://externallyyyoursproductions.com';
    // Note: we store hash, not raw token — can't reconstruct the link. Just notify admin.
    try {
      await resend.emails.send({
        from: 'Smart Files <lee@externallyyyoursproductions.com>',
        to: 'lee@externallyyyoursproductions.com',
        subject: `Reminder: "${file.title}" still awaiting signature`,
        html: `<p>The Smart File "<strong>${file.title}</strong>" for ${file.client_name ?? file.client_email} was sent 3+ days ago and has not been signed yet. Consider following up or re-sending the link from the <a href="${baseUrl}/admin/smart-files/${file.id}">admin dashboard</a>.</p>`,
      });
      await sql`INSERT INTO sf_audit_log (file_id, actor_type, event, payload) VALUES (${file.id}, 'system', 'reminder_sent', ${JSON.stringify({ to: 'admin' })}::jsonb)`;
      remindersSent++;
    } catch (err) { console.error('Reminder email error:', err); }
  }

  return NextResponse.json({ success: true, overdueUpdated, remindersSent });
}
