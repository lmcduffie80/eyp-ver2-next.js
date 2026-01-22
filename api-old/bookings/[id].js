// API endpoint for individual booking operations
// GET /api/bookings/[id] - Get single booking
// PUT /api/bookings/[id] - Update booking
// DELETE /api/bookings/[id] - Delete booking

import sql from '../db/connection.js';
import { setSecurityHeaders, setCORSHeaders } from '../security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers with specific origins
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Booking ID is required' });
    }

    try {
        if (req.method === 'GET') {
            // Get single booking
            const result = await sql`SELECT * FROM bookings WHERE id = ${id}`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            const booking = result.rows[0];
            return res.status(200).json({
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
                    status: booking.status || 'upcoming'
                }
            });

        } else if (req.method === 'PUT') {
            // Update booking - support partial updates
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
            } = req.body;

            let result;

            // Check if this is a notes-only update (common for the notes modal)
            const bodyKeys = Object.keys(req.body);
            const isNotesOnlyUpdate = bodyKeys.length === 1 && bodyKeys[0] === 'notes';

            if (isNotesOnlyUpdate) {
                // Notes-only update: only touch the notes column to avoid constraint violations
                result = await sql`
                    UPDATE bookings SET
                        notes = ${notes},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${id}
                    RETURNING *
                `;
            } else {
                // Full or multi-field update: fetch existing booking and merge
                const existing = await sql`SELECT * FROM bookings WHERE id = ${id}`;
                
                if (existing.rows.length === 0) {
                    return res.status(404).json({ success: false, error: 'Booking not found' });
                }

                const existingBooking = existing.rows[0];

                // Merge provided fields with existing values (only update fields that are provided)
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
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            const booking = result.rows[0];
            return res.status(200).json({
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
                    status: booking.status || 'upcoming'
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete booking
            const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING id`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Booking deleted successfully'
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Booking API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

