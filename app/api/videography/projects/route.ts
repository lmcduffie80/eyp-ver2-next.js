import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

// GET all videography projects
export async function GET() {
  let client;
  
  try {
    client = await getConnection();
    
    const result = await client.query(`
      SELECT 
        vp.*,
        COUNT(vv.id)::int as video_count
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
    const body = await request.json();
    const { project_name, description } = body;
    
    if (!project_name) {
      return NextResponse.json({
        success: false,
        error: 'Project name is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    const result = await client.query(`
      INSERT INTO videography_projects (project_name, description, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING *
    `, [project_name, description || null]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating videography project:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
