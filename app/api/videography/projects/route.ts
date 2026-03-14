import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';
import { cookies } from 'next/headers';

// GET all videography projects
export async function GET() {
  let client;
  
  try {
    client = await getConnection();
    
    const result = await client.query(`
      SELECT 
        vp.*,
        COUNT(vv.id)::int as video_count,
        (
          SELECT video_id 
          FROM videography_videos 
          WHERE project_id = vp.id 
          ORDER BY created_at ASC 
          LIMIT 1
        ) as first_video_id
      FROM videography_projects vp
      LEFT JOIN videography_videos vv ON vp.id = vv.project_id
      GROUP BY vp.id
      ORDER BY vp.display_order ASC, vp.created_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching videography projects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST create new videography project
export async function POST(request: NextRequest) {
  let client;

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
    const { project_name, description } = body;

    if (!project_name) {
      return NextResponse.json({
        success: false,
        error: 'Project name is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Check if table exists, create if it doesn't
    await client.query(`
      CREATE TABLE IF NOT EXISTS videography_projects (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        description TEXT,
        cover_video_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await client.query(`
      INSERT INTO videography_projects (project_name, description, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `, [project_name, description || null]);
    
    console.log('[API] Created video project:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating videography project:', error);
    // Return more detailed error information
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE a videography project
export async function DELETE(request: NextRequest) {
  let client;

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
        error: 'Project ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    const result = await client.query(
      `DELETE FROM videography_projects WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found' 
      }, { status: 404 });
    }
    
    console.log('[API] Deleted video project:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting videography project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
