import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
