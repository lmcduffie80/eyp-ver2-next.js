import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

// GET all DJ Entertainment projects
export async function GET() {
  let client;
  
  try {
    client = await getConnection();
    
    const result = await client.query(`
      SELECT 
        djp.*,
        COUNT(djv.id)::int as video_count,
        (
          SELECT video_id 
          FROM dj_entertainment_videos 
          WHERE project_id = djp.id 
          ORDER BY created_at ASC 
          LIMIT 1
        ) as first_video_id
      FROM dj_entertainment_projects djp
      LEFT JOIN dj_entertainment_videos djv ON djp.id = djv.project_id
      GROUP BY djp.id
      ORDER BY djp.display_order ASC, djp.created_at DESC
    `);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching DJ Entertainment projects:', error);
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

// POST create new DJ Entertainment project
export async function POST(request: NextRequest) {
  let client;
  
  try {
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
      CREATE TABLE IF NOT EXISTS dj_entertainment_projects (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await client.query(`
      INSERT INTO dj_entertainment_projects (project_name, description, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `, [project_name, description || null]);
    
    console.log('[API] Created DJ Entertainment project:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating DJ Entertainment project:', error);
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

// DELETE a DJ Entertainment project
export async function DELETE(request: NextRequest) {
  let client;
  
  try {
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
      `DELETE FROM dj_entertainment_projects WHERE id = $1 RETURNING id`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found' 
      }, { status: 404 });
    }
    
    console.log('[API] Deleted DJ Entertainment project:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting DJ Entertainment project:', error);
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
