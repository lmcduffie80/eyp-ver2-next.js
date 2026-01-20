import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Return empty blocked dates array for now
  return NextResponse.json({
    blockedDates: [],
    total: 0
  });
}

export async function POST(request: Request) {
  // Stub for creating blocked dates
  return NextResponse.json({
    success: true,
    message: 'Blocked date created'
  });
}

