import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET /api/reviews/[id] - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT * FROM reviews WHERE id = ${id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        djUsername: review.dj_username,
        clientName: review.client_name,
        rating: review.rating,
        comment: review.comment,
        eventDate: review.event_date,
        serviceType: review.service_type,
        status: review.status,
        createdAt: review.created_at
      }
    });
  } catch (error) {
    console.error('Review GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/[id] - Update review (primarily for status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

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

    if (status === undefined) {
      return NextResponse.json(
        { success: false, error: 'Status field is required' },
        { status: 400 }
      );
    }

    // Update status
    const result = await sql`
      UPDATE reviews 
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
        id: review.id,
        djUsername: review.dj_username,
        clientName: review.client_name,
        rating: review.rating,
        comment: review.comment,
        eventDate: review.event_date,
        serviceType: review.service_type,
        status: review.status,
        createdAt: review.created_at,
        updatedAt: review.updated_at
      }
    });
  } catch (error) {
    console.error('Review PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      DELETE FROM reviews WHERE id = ${id} RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
