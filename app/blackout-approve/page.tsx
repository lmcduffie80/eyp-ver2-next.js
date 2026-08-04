import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { verifyApprovalToken } from '@/lib/dj-notifications/token';
import { loadDjLookup, loadAllStaffLookup, resolveDj } from '@/lib/dj-notifications/djLookup';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  ADMIN_NOTIFY_TO,
  getResend,
} from '@/lib/dj-notifications/email';
import { PageShell } from '../dj-confirm/PageShell';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

function formatDate(raw: string | Date): string {
  const d = raw instanceof Date ? raw : new Date(raw);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  });
}

export default async function BlackoutApprovePage({ searchParams }: PageProps) {
  const { token = '' } = await searchParams;
  const payload = token ? verifyApprovalToken(token) : null;

  if (!payload) {
    return (
      <PageShell headline="Link expired or invalid" tone="muted">
        <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
          This approval link couldn&rsquo;t be verified. It may have been altered or already used.
          Please approve from the <a href="/admin" style={{ color: '#f97316' }}>admin dashboard</a>.
        </p>
      </PageShell>
    );
  }

  // Fetch the blocked date record.
  const rows = normalizeRows(await sql`
    SELECT id, dj_user, date, reason, status FROM blocked_dates WHERE id = ${payload.blockedDateId} LIMIT 1
  `);

  if (rows.length === 0) {
    return (
      <PageShell headline="Request not found" tone="muted">
        <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
          This time-off request no longer exists. It may have been deleted.
        </p>
      </PageShell>
    );
  }

  const record = rows[0];
  const formattedDate = formatDate(record.date);

  // Idempotent — if already approved, just confirm that gracefully.
  if (record.status === 'approved') {
    return (
      <PageShell headline="Already approved" tone="success">
        <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
          {record.dj_user}&rsquo;s time-off request for <strong>{formattedDate}</strong> was already approved.
        </p>
      </PageShell>
    );
  }

  // Mark approved.
  await sql`UPDATE blocked_dates SET status = 'approved' WHERE id = ${payload.blockedDateId}`;

  // Send confirmation email to the DJ (CC Lee) — fire-and-forget.
  try {
    if (process.env.RESEND_API_KEY) {
      const { byKey: djByKey } = await loadDjLookup();
      let djRecord = resolveDj(record.dj_user, djByKey);
      if (!djRecord) {
        const { byKey: allByKey } = await loadAllStaffLookup();
        djRecord = resolveDj(record.dj_user, allByKey);
      }
      const djEmail = djRecord?.email ?? null;
      const djFirstName = djRecord?.firstName || record.dj_user;

      if (djEmail) {
        const resend = getResend();
        await resend.emails.send({
          from: NOTIFICATION_FROM,
          to: djEmail,
          cc: ADMIN_NOTIFY_TO,
          replyTo: NOTIFICATION_REPLY_TO,
          subject: `Your time-off request for ${formattedDate} has been approved`,
          html: `
            <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f4f5;border-radius:12px">
              <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0">
                <div style="font-size:14px;letter-spacing:1px;color:#f97316;font-weight:600">EXTERNALLY YOURS PRODUCTIONS</div>
              </div>
              <div style="background:#ffffff;padding:28px;border-radius:0 0 8px 8px">
                <h2 style="color:#16a34a;margin:0 0 12px 0;font-size:20px">✓ Time-Off Approved</h2>
                <p style="color:#374151;font-size:15px;line-height:1.55">Hi ${djFirstName},</p>
                <p style="color:#374151;font-size:15px;line-height:1.55">
                  Your time-off request has been approved for:
                </p>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:12px 0;background:#f0fdf4">
                  <div style="font-size:16px;font-weight:600;color:#111827">${formattedDate}</div>
                  ${record.reason ? `<div style="font-size:13px;color:#6b7280;margin-top:6px">Reason: ${record.reason}</div>` : ''}
                </div>
                <p style="color:#6b7280;font-size:13px;margin-top:16px">
                  This date is now blocked on your calendar. Questions? Reply to this email.
                </p>
              </div>
            </div>
          `,
          text: [
            `Hi ${djFirstName},`,
            '',
            `Your time-off request for ${formattedDate} has been approved.`,
            record.reason ? `Reason: ${record.reason}` : '',
            '',
            `This date is now blocked on your calendar. Questions? Contact ${NOTIFICATION_REPLY_TO}.`,
          ].filter(Boolean).join('\n'),
        });
      }
    }
  } catch (err) {
    console.error('[blackout-approve] DJ email failed:', err);
  }

  return (
    <PageShell headline="Request approved!" tone="success">
      <p style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
        You&rsquo;ve approved <strong>{record.dj_user}</strong>&rsquo;s time-off request.
        A confirmation email has been sent to them.
      </p>
      <div
        style={{
          border: '1px solid #bbf7d0',
          borderRadius: 10,
          padding: '14px 16px',
          background: '#f0fdf4',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{record.dj_user}</div>
        <div style={{ fontSize: 14, color: '#374151', marginTop: 6 }}>{formattedDate}</div>
        {record.reason && (
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Reason: {record.reason}</div>
        )}
      </div>
      <p style={{ margin: '16px 0 0 0', fontSize: 13, color: '#6b7280' }}>
        <a href="/admin" style={{ color: '#f97316', textDecoration: 'none' }}>
          Back to admin dashboard →
        </a>
      </p>
    </PageShell>
  );
}
