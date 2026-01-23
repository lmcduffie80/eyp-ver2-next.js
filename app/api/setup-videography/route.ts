import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

export async function POST() {
  let client;
  
  try {
    client = await getConnection();
    
    // Create videography_projects table
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
    
    // Create videography_videos table
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Videography tables created successfully' 
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create videography tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
