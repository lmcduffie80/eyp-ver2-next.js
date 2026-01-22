import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api/db/connection';

// GET reviews with filters
export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const djUsername = searchParams.get('dj_username') || '';
    const serviceType = searchParams.get('service_type') || '';
    
    client = await getConnection();
    
    let query = `
      SELECT 
        id, dj_username, client_name, rating, comment, 
        event_name, event_date, service_type, status, 
        created_at, updated_at
      FROM reviews
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;
    
    // Filter by status
    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Filter by DJ username
    if (djUsername) {
      query += ` AND LOWER(dj_username) = LOWER($${paramIndex})`;
      params.push(djUsername);
      paramIndex++;
    }
    
    // Filter by service type
    if (serviceType) {
      query += ` AND service_type = $${paramIndex}`;
      params.push(serviceType);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await client.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST create new review
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { 
      clientName, serviceType, djUsername, rating, 
      comment, eventDate, eventName 
    } = body;
    
    // Validate required fields
    if (!clientName || !serviceType || !comment) {
      return NextResponse.json({
        success: false,
        error: 'Client name, service type, and comment are required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Insert new review with pending status
    const result = await client.query(`
      INSERT INTO reviews (
        client_name, service_type, dj_username, rating, 
        comment, event_date, event_name, status, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
      RETURNING 
        id, dj_username, client_name, rating, comment, 
        event_name, event_date, service_type, status, 
        created_at, updated_at
    `, [
      clientName,
      serviceType,
      djUsername || null,
      rating || null,
      comment,
      eventDate || null,
      eventName || null
    ]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Review submitted successfully and is pending approval'
    });
    
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// PUT update review status (approve/reject)
export async function PUT(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { id, status, comment, rating } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Review ID is required'
      }, { status: 400 });
    }
    
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if review exists
    const existingReview = await client.query(
      'SELECT id FROM reviews WHERE id = $1',
      [id]
    );
    
    if (existingReview.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    
    if (comment !== undefined) {
      updates.push(`comment = $${paramIndex++}`);
      values.push(comment);
    }
    
    if (rating !== undefined) {
      updates.push(`rating = $${paramIndex++}`);
      values.push(rating);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 1) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }
    
    values.push(id);
    const query = `
      UPDATE reviews 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, dj_username, client_name, rating, comment, 
        event_name, event_date, service_type, status, 
        created_at, updated_at
    `;
    
    const result = await client.query(query, values);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `Review ${status || 'updated'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE remove review
export async function DELETE(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Review ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if review exists
    const review = await client.query(
      'SELECT id FROM reviews WHERE id = $1',
      [id]
    );
    
    if (review.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    // Delete review
    await client.query('DELETE FROM reviews WHERE id = $1', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
