import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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
