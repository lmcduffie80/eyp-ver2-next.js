import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';

export async function POST() {
  try {
    // Add status column to bookings table
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'upcoming'
    `;

    // Set past bookings (before today) to 'completed' if they don't have a status
    await sql`
      UPDATE bookings 
      SET status = 'completed' 
      WHERE date < CURRENT_DATE 
      AND (status IS NULL OR status = 'upcoming')
    `;

    // Set future bookings to 'upcoming' if they don't have a status
    await sql`
      UPDATE bookings 
      SET status = 'upcoming' 
      WHERE date >= CURRENT_DATE 
      AND status IS NULL
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Booking status column added and data migrated successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error migrating booking status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to migrate booking status', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if migration has been run
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'status'
    `;

    const migrated = result.rows.length > 0;

    return NextResponse.json({ 
      success: true, 
      migrated,
      message: migrated ? 'Status column exists' : 'Status column needs to be added'
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check migration status' 
    }, { status: 500 });
  }
}
