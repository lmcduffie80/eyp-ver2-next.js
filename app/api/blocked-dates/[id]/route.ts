import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { loadDjLookup, loadAllStaffLookup, resolveDj } from '@/lib/dj-notifications/djLookup';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  ADMIN_NOTIFY_TO,
  getResend,
} from '@/lib/dj-notifications/email';

// GET /api/blocked-dates/[id] - Get single blocked date
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT * FROM blocked_dates WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    const blockedDate = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: blockedDate.id,
        djUser: blockedDate.dj_user,
        date: blockedDate.date,
        reason: blockedDate.reason,
        blockedBy: blockedDate.blocked_by,
        status: blockedDate.status || 'approved',
        createdAt: blockedDate.created_at
      }
    });
  } catch (error) {
    console.error('Blocked date GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/blocked-dates/[id] - Update blocked date (status, djUser, reason, date)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, djUser, reason, date } = body;

    // Validate that at least one field is provided
    if (status === undefined && djUser === undefined && reason === undefined && date === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one field must be provided for update (status, djUser, reason, or date)'
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status !== undefined && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid status is required: pending, approved, or rejected'
        },
        { status: 400 }
      );
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (djUser !== undefined) {
      updates.push(`dj_user = $${paramIndex++}`);
      values.push(djUser);
    }
    if (reason !== undefined) {
      updates.push(`reason = $${paramIndex++}`);
      values.push(reason);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(date);
    }

    const query = `
      UPDATE blocked_dates 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    const blockedDate = result.rows[0];

    // When a request is approved, email the DJ and copy Lee.
    if (status === 'approved' && process.env.RESEND_API_KEY) {
      try {
        const dateObj = blockedDate.date instanceof Date
          ? blockedDate.date
          : new Date(blockedDate.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });

        // Resolve the DJ's email from the users table.
        const { byKey: djByKey } = await loadDjLookup();
        let djRecord = resolveDj(blockedDate.dj_user, djByKey);
        if (!djRecord) {
          const { byKey: allByKey } = await loadAllStaffLookup();
          djRecord = resolveDj(blockedDate.dj_user, allByKey);
        }
        const djEmail = djRecord?.email ?? null;
        const djFirstName = djRecord?.firstName || blockedDate.dj_user;

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
                <div style="background:#ffffff;padding:28px 28px 8px 28px;border-radius:0 0 8px 8px">
                  <h2 style="color:#16a34a;margin:0 0 12px 0;font-size:20px">✓ Time-Off Approved</h2>
                  <p style="color:#374151;font-size:15px;line-height:1.55">Hi ${djFirstName},</p>
                  <p style="color:#374151;font-size:15px;line-height:1.55">
                    Your time-off request has been approved for:
                  </p>
                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin:12px 0;background:#f0fdf4">
                    <div style="font-size:16px;font-weight:600;color:#111827">${formattedDate}</div>
                    ${blockedDate.reason ? `<div style="font-size:13px;color:#6b7280;margin-top:6px">Reason: ${blockedDate.reason}</div>` : ''}
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
              blockedDate.reason ? `Reason: ${blockedDate.reason}` : '',
              '',
              `This date is now blocked on your calendar. Questions? Contact ${NOTIFICATION_REPLY_TO}.`,
            ].filter(Boolean).join('\n'),
          });
        }
      } catch (emailErr) {
        console.error('[blocked-dates] Approval email failed:', emailErr);
        // Do not fail the API — the DB update already succeeded.
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: blockedDate.id,
        djUser: blockedDate.dj_user,
        date: blockedDate.date,
        reason: blockedDate.reason,
        blockedBy: blockedDate.blocked_by,
        status: blockedDate.status || 'approved',
        createdAt: blockedDate.created_at
      }
    });
  } catch (error) {
    console.error('Blocked date PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/blocked-dates/[id] - Delete blocked date
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM blocked_dates WHERE id = ${id} RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Blocked date not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blocked date deleted successfully'
    });
  } catch (error) {
    console.error('Blocked date DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
