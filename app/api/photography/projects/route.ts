import { NextRequest, NextResponse } from 'next/server';
import sql from '../../../../api-old/db/connection.js';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Fetch all projects with photo count
    const result = await sql`
      SELECT 
        p.*,
        COUNT(ph.id) as photo_count
      FROM photography_projects p
      LEFT JOIN photography_photos ph ON p.id = ph.project_id
      GROUP BY p.id
      ORDER BY p.display_order ASC, p.created_at DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      data: result.rows || result
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching photography projects:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { project_name, description, display_order = 0, is_featured = false } = body;

    if (!project_name) {
      return NextResponse.json({
        success: false,
        error: 'Project name is required'
      }, { status: 400 });
    }
    
    const result = await sql`
      INSERT INTO photography_projects (project_name, description, display_order, is_featured)
      VALUES (${project_name}, ${description || null}, ${display_order}, ${is_featured})
      RETURNING *
    `;
    
    const rows = (result.rows || result) as any[];
    return NextResponse.json({ 
      success: true, 
      data: rows[0]
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating photography project:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, project_name, description, cover_photo_url, display_order, is_featured } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 });
    }
    
    const result = await sql`
      UPDATE photography_projects
      SET 
        project_name = COALESCE(${project_name}, project_name),
        description = COALESCE(${description}, description),
        cover_photo_url = COALESCE(${cover_photo_url}, cover_photo_url),
        display_order = COALESCE(${display_order}, display_order),
        is_featured = COALESCE(${is_featured}, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: rows[0]
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating photography project:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;

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
        error: 'Project ID is required'
      }, { status: 400 });
    }
    
    const result = await sql`
      DELETE FROM photography_projects
      WHERE id = ${id}
      RETURNING id
    `;
    
    const rows = result.rows || result;
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting photography project:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
