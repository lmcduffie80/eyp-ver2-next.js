import { NextResponse } from 'next/server';
import sql from '../../../api/db/connection.js';

export async function GET() {
  try {
    // Create photography_projects table
    await sql`
      CREATE TABLE IF NOT EXISTS photography_projects (
        id SERIAL PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        cover_photo_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create photography_photos table
    await sql`
      CREATE TABLE IF NOT EXISTS photography_photos (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES photography_projects(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_photography_projects_display_order ON photography_projects(display_order)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_photography_photos_project_id ON photography_photos(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_photography_photos_display_order ON photography_photos(display_order)`;

    // Create update trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_photography_projects_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    // Create trigger
    await sql`DROP TRIGGER IF EXISTS update_photography_projects_timestamp ON photography_projects`;
    await sql`
      CREATE TRIGGER update_photography_projects_timestamp
      BEFORE UPDATE ON photography_projects
      FOR EACH ROW
      EXECUTE FUNCTION update_photography_projects_updated_at()
    `;

    return NextResponse.json({
      success: true,
      message: 'Photography tables created successfully!',
      tables: ['photography_projects', 'photography_photos']
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
