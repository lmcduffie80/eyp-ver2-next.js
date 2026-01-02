import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  // Return empty reviews array for now
  return NextResponse.json({
    reviews: [],
    total: 0,
    status: status
  });
}

