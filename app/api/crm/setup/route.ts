import { NextResponse } from 'next/server';
import sql, { getConnection } from '@/api-old/db/connection';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read the CRM schema file
    const schemaPath = path.join(process.cwd(), 'api-old', 'db', 'crm-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema using raw query
    const client = await getConnection();
    try {
      await client.query(schema);
    } finally {
      client.release();
    }
    
    return NextResponse.json({
      success: true,
      message: 'CRM database tables created successfully'
    });
  } catch (error: any) {
    console.error('CRM setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to initialize CRM database'
  });
}
