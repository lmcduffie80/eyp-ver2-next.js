import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

// GET all pricing packages (with optional service_type filter)
export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const service_type = searchParams.get('service_type');
    
    client = await getConnection();
    
    let query = `
      SELECT * FROM pricing_packages
      WHERE is_active = true
    `;
    const params: any[] = [];
    
    if (service_type) {
      query += ` AND service_type = $1`;
      params.push(service_type);
    }
    
    query += ` ORDER BY display_order ASC, created_at ASC`;
    
    const result = await client.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching pricing packages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pricing packages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST create new pricing package
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { service_type, package_name, price, description, features, display_order } = body;
    
    if (!service_type || !package_name || price === undefined) {
      return NextResponse.json({
        success: false,
        error: 'service_type, package_name, and price are required'
      }, { status: 400 });
    }
    
    if (!['videography', 'photography', 'dj'].includes(service_type)) {
      return NextResponse.json({
        success: false,
        error: 'service_type must be videography, photography, or dj'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    const result = await client.query(`
      INSERT INTO pricing_packages 
      (service_type, package_name, price, description, features, display_order, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      service_type,
      package_name,
      parseFloat(price),
      description || null,
      JSON.stringify(features || []),
      display_order || 0
    ]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating pricing package:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create pricing package',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// PUT update pricing package
export async function PUT(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { id, package_name, price, description, features, display_order, is_active } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    const result = await client.query(`
      UPDATE pricing_packages
      SET 
        package_name = COALESCE($1, package_name),
        price = COALESCE($2, price),
        description = COALESCE($3, description),
        features = COALESCE($4, features),
        display_order = COALESCE($5, display_order),
        is_active = COALESCE($6, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [
      package_name,
      price ? parseFloat(price) : null,
      description,
      features ? JSON.stringify(features) : null,
      display_order,
      is_active,
      id
    ]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Package not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating pricing package:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update pricing package',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE remove pricing package
export async function DELETE(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    await client.query('DELETE FROM pricing_packages WHERE id = $1', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting pricing package:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pricing package',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
