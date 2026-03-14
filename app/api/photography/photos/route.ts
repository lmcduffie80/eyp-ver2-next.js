import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../../api-old/db/connection.js';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    
    if (!project_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project ID is required' 
      }, { status: 400 });
    }
    
    const result = await sql`
      SELECT *
      FROM photography_photos
      WHERE project_id = ${project_id}
      ORDER BY display_order ASC, uploaded_at DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows || result
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch photos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { project_id, photo_url, thumbnail_url, caption, display_order = 0 } = body;

    if (!project_id || !photo_url) {
      return NextResponse.json({
        success: false,
        error: 'Project ID and photo URL are required'
      }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO photography_photos (project_id, photo_url, thumbnail_url, caption, display_order)
      VALUES (${project_id}, ${photo_url}, ${thumbnail_url || null}, ${caption || null}, ${display_order})
      RETURNING *
    `;
    
    // Update project's cover photo if it doesn't have one
    await sql`
      UPDATE photography_projects
      SET cover_photo_url = ${photo_url}
      WHERE id = ${project_id} AND cover_photo_url IS NULL
    `;
    
    const rows = (result.rows || result) as any[];
    return NextResponse.json({ 
      success: true, 
      data: rows[0]
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, caption, display_order } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }
    
    const result = await sql`
      UPDATE photography_photos
      SET 
        caption = COALESCE(${caption}, caption),
        display_order = COALESCE(${display_order}, display_order)
      WHERE id = ${id}
      RETURNING *
    `;
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Photo not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: rows[0]
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_user_id')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Photo ID is required'
      }, { status: 400 });
    }
    
    const result = await sql`
      DELETE FROM photography_photos
      WHERE id = ${id}
      RETURNING id, project_id
    `;
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Photo not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Photo deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete photo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
