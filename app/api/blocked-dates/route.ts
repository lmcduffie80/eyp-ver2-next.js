import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Resend } from 'resend';
import { NOTIFICATION_FROM, ADMIN_NOTIFY_TO } from '@/lib/dj-notifications/email';
import { signApprovalToken } from '@/lib/dj-notifications/token';

// GET /api/blocked-dates - Get all blocked dates or filter by DJ
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dj_user = searchParams.get('dj_user');
    const status = searchParams.get('status');

    let result;
    
    if (dj_user && status) {
      result = await sql`
        SELECT * FROM blocked_dates 
        WHERE dj_user = ${dj_user} AND status = ${status}
        ORDER BY date DESC
      `;
    } else if (dj_user) {
      result = await sql`
        SELECT * FROM blocked_dates 
        WHERE dj_user = ${dj_user}
        ORDER BY date DESC
      `;
    } else if (status) {
      result = await sql`
        SELECT * FROM blocked_dates 
        WHERE status = ${status}
        ORDER BY date DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM blocked_dates 
        ORDER BY date DESC
      `;
    }

    const mappedData = result.rows.map(row => ({
      id: row.id,
      djUser: row.dj_user,
      date: row.date,
      reason: row.reason,
      blockedBy: row.blocked_by,
      status: row.status || 'approved',
      createdAt: row.created_at
    }));

    return NextResponse.json({
      success: true,
      data: mappedData
    });
  } catch (error) {
    console.error('Error in blocked-dates GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocked dates' },
      { status: 500 }
    );
  }
}

// POST /api/blocked-dates - Create new blocked date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { djUser, date, reason, blockedBy } = body;

    // Validation
    if (!djUser || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: djUser, date' },
        { status: 400 }
      );
    }

    // Insert blocked date with status 'pending' by default
    const result = await sql`
      INSERT INTO blocked_dates (dj_user, date, reason, blocked_by, status)
      VALUES (${djUser}, ${date}, ${reason || null}, ${blockedBy || djUser}, 'pending')
      RETURNING *
    `;

    const blockedDate = result.rows[0];

    // Send admin notification email via Resend (non-blocking; do not fail API on email error)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const dateObj =
          typeof blockedDate.date === 'string'
            ? new Date(blockedDate.date)
            : blockedDate.date instanceof Date
              ? blockedDate.date
              : new Date(blockedDate.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.externallyyoursproductions.com').replace(/\/+$/, '');
        const approveToken = signApprovalToken({ blockedDateId: blockedDate.id, djUser: blockedDate.dj_user });
        const approveUrl = `${baseUrl}/blackout-approve?token=${encodeURIComponent(approveToken)}`;

        await resend.emails.send({
          from: NOTIFICATION_FROM,
          to: ADMIN_NOTIFY_TO,
          subject: `Time-off request: ${blockedDate.dj_user} – ${formattedDate}`,
          html: `
            <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#f4f4f5;border-radius:12px">
              <div style="background:#111827;padding:20px 24px;border-radius:8px 8px 0 0">
                <div style="font-size:14px;letter-spacing:1px;color:#f97316;font-weight:600">EXTERNALLY YOURS PRODUCTIONS</div>
                <div style="font-size:12px;color:#9ca3af;margin-top:4px">DJ Time-Off Request</div>
              </div>
              <div style="background:#fff;padding:28px;border-radius:0 0 8px 8px">
                <h2 style="margin:0 0 16px 0;font-size:20px;color:#111827">New time-off request</h2>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:20px;background:#f9fafb">
                  <div style="font-size:16px;font-weight:600;color:#111827">${blockedDate.dj_user}</div>
                  <div style="font-size:14px;color:#374151;margin-top:6px">${formattedDate}</div>
                  <div style="font-size:13px;color:#6b7280;margin-top:4px">Reason: ${blockedDate.reason || 'Not provided'}</div>
                </div>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 16px 0">
                  <tr>
                    <td style="border-radius:8px;background:#16a34a">
                      <a href="${approveUrl}" style="display:inline-block;padding:14px 28px;color:#fff;text-decoration:none;font-weight:600;font-size:16px">✓ Approve Request</a>
                    </td>
                  </tr>
                </table>
                <p style="font-size:13px;color:#6b7280;margin:0">
                  Or manage all requests in the <a href="${baseUrl}/admin" style="color:#f97316;text-decoration:none">admin dashboard</a>.
                </p>
              </div>
            </div>
          `,
          text: `${blockedDate.dj_user} submitted a time-off request for ${formattedDate}.\nReason: ${blockedDate.reason || 'Not provided'}\n\nApprove: ${approveUrl}\n\nOr visit the admin dashboard: ${baseUrl}/admin`,
        });
      } catch (emailError) {
        console.error('Resend blackout-date notification failed:', emailError);
        // Do not fail the API; blocked date was saved successfully
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: blockedDate.id,
          djUser: blockedDate.dj_user,
          date: blockedDate.date,
          reason: blockedDate.reason,
          blockedBy: blockedDate.blocked_by,
          status: blockedDate.status,
          createdAt: blockedDate.created_at
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in blocked-dates POST API:', error);
    
    // Handle duplicate entry error
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'This date is already blocked for this DJ' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create blocked date' },
      { status: 500 }
    );
  }
}
