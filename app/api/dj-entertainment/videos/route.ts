import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';
import { cookies } from 'next/headers';

// Detect platform and extract video ID from various URL formats
function detectPlatformAndExtractId(url: string): { platform: string; videoId: string } | null {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  // TikTok patterns
  const tiktokPatterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
    /vt\.tiktok\.com\/([A-Za-z0-9]+)/
  ];
  
  // Instagram patterns
  const instagramPatterns = [
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
    /instagr\.am\/p\/([A-Za-z0-9_-]+)/
  ];
  
  // Check YouTube
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { platform: 'youtube', videoId: match[1] };
    }
  }
  
  // Check TikTok
  for (const pattern of tiktokPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { platform: 'tiktok', videoId: match[1] };
    }
  }
  
  // Check Instagram
  for (const pattern of instagramPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { platform: 'instagram', videoId: match[1] };
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
      SELECT * FROM dj_entertainment_videos
      WHERE project_id = $1
      ORDER BY display_order ASC, created_at DESC
    `, [project_id]);
    
    console.log(`[API] DJ Entertainment videos query: Found ${result.rows.length} videos for project ${project_id}`);
    if (result.rows.length > 0) {
      console.log('[API] Sample video:', result.rows[0]);
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching DJ Entertainment videos:', error);
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
    const { project_id, video_url, title, description } = body;

    if (!project_id || !video_url) {
      return NextResponse.json({
        success: false,
        error: 'project_id and video_url are required'
      }, { status: 400 });
    }
    
    // Detect platform and extract video ID
    const detected = detectPlatformAndExtractId(video_url);
    
    if (!detected) {
      return NextResponse.json({
        success: false,
        error: 'Invalid video URL. Please provide a valid YouTube, TikTok, or Instagram video URL.'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    // Ensure videos table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS dj_entertainment_videos (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES dj_entertainment_projects(id) ON DELETE CASCADE,
        video_url TEXT NOT NULL,
        video_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        title TEXT,
        description TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await client.query(`
      INSERT INTO dj_entertainment_videos 
      (project_id, video_url, video_id, platform, title, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [project_id, video_url, detected.videoId, detected.platform, title || null, description || null]);
    
    console.log('[API] Added DJ Entertainment video:', result.rows[0]);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating DJ Entertainment video:', error);
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
        error: 'Video ID is required'
      }, { status: 400 });
    }
    
    client = await getConnection();
    
    await client.query('DELETE FROM dj_entertainment_videos WHERE id = $1', [id]);
    
    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting DJ Entertainment video:', error);
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
