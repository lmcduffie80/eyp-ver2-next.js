import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT * FROM bookings WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = result.rows[0];
    return NextResponse.json({
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
        totalRevenue: booking.total_revenue ? parseFloat(booking.total_revenue) : null,
        ccPayment: booking.cc_payment ? parseFloat(booking.cc_payment) : null,
        payout: booking.payout ? parseFloat(booking.payout) : null,
        status: booking.status || 'upcoming',
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }
    });
  } catch (error) {
    console.error('Error in bookings GET [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    let result;

    // Check if this is a notes-only update
    const bodyKeys = Object.keys(body);
    const isNotesOnlyUpdate = bodyKeys.length === 1 && bodyKeys[0] === 'notes';

    if (isNotesOnlyUpdate) {
      // Notes-only update
      result = await sql`
        UPDATE bookings SET
          notes = ${notes},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // Full or multi-field update
      const existing = await sql`SELECT * FROM bookings WHERE id = ${id}`;

      if (existing.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }

      const existingBooking = existing.rows[0];

      result = await sql`
        UPDATE bookings SET
          dj_user = ${djUser !== undefined ? djUser : existingBooking.dj_user},
          client_name = ${clientName !== undefined ? clientName : existingBooking.client_name},
          event_type = ${eventType !== undefined ? eventType : existingBooking.event_type},
          date = ${date !== undefined ? date : existingBooking.date},
          time = ${time !== undefined ? time : existingBooking.time},
          location = ${location !== undefined ? location : existingBooking.location},
          contact_email = ${contactEmail !== undefined ? contactEmail : existingBooking.contact_email},
          contact_phone = ${contactPhone !== undefined ? contactPhone : existingBooking.contact_phone},
          notes = ${notes !== undefined ? notes : existingBooking.notes},
          total_revenue = ${totalRevenue !== undefined ? totalRevenue : existingBooking.total_revenue},
          cc_payment = ${ccPayment !== undefined ? ccPayment : existingBooking.cc_payment},
          payout = ${payout !== undefined ? payout : existingBooking.payout},
          status = ${status !== undefined ? status : existingBooking.status},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const booking = result.rows[0];
    return NextResponse.json({
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
        totalRevenue: booking.total_revenue ? parseFloat(booking.total_revenue) : null,
        ccPayment: booking.cc_payment ? parseFloat(booking.cc_payment) : null,
        payout: booking.payout ? parseFloat(booking.payout) : null,
        status: booking.status,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }
    });
  } catch (error) {
    console.error('Error in bookings PUT [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM bookings WHERE id = ${id} RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error in bookings DELETE [id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
