import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Return empty bookings array for now
  return NextResponse.json({
    bookings: [],
    total: 0
  });
}

