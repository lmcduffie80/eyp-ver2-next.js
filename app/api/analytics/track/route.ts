import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      visitorId,
      sessionId,
      page,
      referrer,
      referrerSource,
      deviceType,
      userAgent,
      timestamp
    } = body;

    // Validate required fields
    if (!visitorId || !sessionId || !page) {
      return NextResponse.json(
        { error: 'Missing required fields: visitorId, sessionId, page' },
        { status: 400 }
      );
    }

    // Insert into database
    await sql`
      INSERT INTO analytics_visits (
        visitor_id,
        session_id,
        page,
        referrer,
        referrer_source,
        device_type,
        user_agent,
        timestamp
      ) VALUES (
        ${visitorId},
        ${sessionId},
        ${page},
        ${referrer || ''},
        ${referrerSource || 'Direct'},
        ${deviceType || 'Desktop'},
        ${userAgent || ''},
        ${timestamp ? new Date(timestamp) : new Date()}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics', details: error.message },
      { status: 500 }
    );
  }
}
