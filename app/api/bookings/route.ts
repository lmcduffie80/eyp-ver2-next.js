import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/bookings - Get all bookings with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dj_user = searchParams.get('dj_user');
    const status = searchParams.get('status');

    // First, get all DJ users to normalize DJ names
    const djUsersResult = await sql`
      SELECT id, username, first_name, last_name 
      FROM users 
      WHERE user_type = 'dj'
    `;
    const djUsers = djUsersResult.rows;

    // Create a map for quick lookup
    const djNameMap = new Map();
    djUsers.forEach((dj: any) => {
      const firstName = (dj.first_name || '').trim();
      const lastName = (dj.last_name || '').trim();
      const normalizedName = (firstName && lastName)
        ? `${firstName} ${lastName}`
        : dj.username;

      // Map all possible variations to the normalized name
      if (firstName && lastName) {
        const fullName = `${firstName} ${lastName}`;
        djNameMap.set(fullName.toLowerCase(), normalizedName);
        djNameMap.set(`${lastName} ${firstName}`.toLowerCase(), normalizedName);
      }
      if (firstName) {
        djNameMap.set(firstName.toLowerCase(), normalizedName);
      }
      if (lastName) {
        djNameMap.set(lastName.toLowerCase(), normalizedName);
      }
      if (dj.username) {
        djNameMap.set(dj.username.toLowerCase(), normalizedName);
      }
      djNameMap.set(normalizedName.toLowerCase(), normalizedName);
    });

    // Normalize the incoming dj_user parameter
    let normalizedDjUser = dj_user;
    if (dj_user) {
      const djUserLower = dj_user.toLowerCase().trim();
      if (djNameMap.has(djUserLower)) {
        normalizedDjUser = djNameMap.get(djUserLower);
      } else {
        // Try partial matching
        for (const [key, value] of djNameMap.entries()) {
          if (djUserLower === key || key.includes(djUserLower) || djUserLower.includes(key)) {
            normalizedDjUser = value;
            break;
          }
        }
      }
    }

    const showArchived = searchParams.get('archived') === 'true';

    // Build dynamic query based on filters
    let result;
    if (showArchived) {
      // Fetch archived bookings only
      if (normalizedDjUser) {
        result = await sql`
          SELECT * FROM bookings 
          WHERE dj_user = ${normalizedDjUser} AND archived = TRUE
          ORDER BY archived_at DESC, id DESC
        `;
      } else {
        result = await sql`
          SELECT * FROM bookings 
          WHERE archived = TRUE
          ORDER BY archived_at DESC, id DESC
        `;
      }
    } else if (normalizedDjUser && status) {
      result = await sql`
        SELECT * FROM bookings 
        WHERE dj_user = ${normalizedDjUser} AND status = ${status}
        AND (archived = FALSE OR archived IS NULL)
        ORDER BY date DESC, id DESC
      `;
    } else if (normalizedDjUser) {
      result = await sql`
        SELECT * FROM bookings 
        WHERE dj_user = ${normalizedDjUser}
        AND (archived = FALSE OR archived IS NULL)
        ORDER BY date DESC, id DESC
      `;
    } else if (status) {
      result = await sql`
        SELECT * FROM bookings 
        WHERE status = ${status}
        AND (archived = FALSE OR archived IS NULL)
        ORDER BY date DESC, id DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM bookings 
        WHERE (archived = FALSE OR archived IS NULL)
        ORDER BY date DESC, id DESC
      `;
    }

    const mappedData = result.rows.map((row: any) => ({
      id: row.id,
      djUser: row.dj_user,
      clientName: row.client_name,
      eventType: row.event_type,
      date: row.date,
      time: row.time,
      location: row.location,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      notes: row.notes,
      totalRevenue: row.total_revenue,
      ccPayment: row.cc_payment,
      payout: row.payout,
      status: row.status || 'upcoming',
      archived: row.archived || false,
      archivedAt: row.archived_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: mappedData
    });
  } catch (error) {
    console.error('Error in bookings GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      djUser,
      clientName,
      eventType,
      date,
      time,
      location,
      contactEmail,
      contactPhone,
      notes,
      totalRevenue,
      ccPayment,
      payout,
      status
    } = body;

    // Validation
    if (!djUser || !clientName || !eventType || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: djUser, clientName, eventType, date' },
        { status: 400 }
      );
    }

    // Insert booking
    const result = await sql`
      INSERT INTO bookings (
        dj_user, client_name, event_type, date, time, location,
        contact_email, contact_phone, notes, total_revenue, cc_payment,
        payout, status
      ) VALUES (
        ${djUser}, ${clientName}, ${eventType}, ${date}, ${time || null},
        ${location || null}, ${contactEmail || null}, ${contactPhone || null},
        ${notes || null}, ${totalRevenue || null}, ${ccPayment || null},
        ${payout || null}, ${status || 'upcoming'}
      )
      RETURNING *
    `;

    const booking = result.rows[0];
    return NextResponse.json(
      {
        success: true,
        data: {
          id: booking.id,
          djUser: booking.dj_user,
          clientName: booking.client_name,
          eventType: booking.event_type,
          date: booking.date,
          time: booking.time,
          location: booking.location,
          contactEmail: booking.contact_email,
          contactPhone: booking.contact_phone,
          notes: booking.notes,
          totalRevenue: booking.total_revenue,
          ccPayment: booking.cc_payment,
          payout: booking.payout,
          status: booking.status,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in bookings POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
