import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// GET videos for a project
export async function GET(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    
    if (!project_id) {
      return NextResponse.json({
        success: false,
        error: 'project_id is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    const result = await client.query(`
      SELECT * FROM videography_videos
      WHERE project_id = $1
      ORDER BY display_order ASC, created_at DESC
    `, [project_id]);
    
    console.log(`[API] Videography videos query: Found ${result.rows.length} videos for project ${project_id}`);
    if (result.rows.length > 0) {
      console.log('[API] Sample video:', result.rows[0]);
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// POST create new video
export async function POST(request: NextRequest) {
  let client;
  
  try {
    const body = await request.json();
    const { project_id, video_url, title, description } = body;
    
    if (!project_id || !video_url) {
      return NextResponse.json({
        success: false,
        error: 'project_id and video_url are required'
      }, { status: 400 });
    }
    
    // Extract YouTube video ID
    const video_id = extractYouTubeVideoId(video_url);
    
    if (!video_id) {
      return NextResponse.json({
        success: false,
        error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Ensure videos table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS videography_videos (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES videography_projects(id) ON DELETE CASCADE,
        video_url TEXT NOT NULL,
        video_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await client.query(`
      INSERT INTO videography_videos 
      (project_id, video_url, video_id, title, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [project_id, video_url, video_id, title || null, description || null]);
    
    console.log('[API] Added video:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// DELETE remove a video
export async function DELETE(request: NextRequest) {
  let client;
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Video ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    await client.query('DELETE FROM videography_videos WHERE id = $1', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
