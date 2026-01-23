import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

export async function POST() {
  let client;
  
  try {
    client = await getConnection();
    
    // Create pricing_packages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_packages (
        id SERIAL PRIMARY KEY,
        service_type TEXT NOT NULL CHECK (service_type IN ('videography', 'photography', 'dj')),
        package_name TEXT NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pricing packages table created successfully' 
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create pricing packages table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
