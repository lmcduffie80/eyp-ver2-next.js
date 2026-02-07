import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import { normalizeRows } from '@/lib/db-utils';

// Verify CRM admin authentication
async function verifyCRMAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('crm_session');
  const userId = cookieStore.get('crm_user_id');
  
  if (!session || !userId) {
    return null;
  }
  
  return userId.value;
}

export async function GET(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = sql`
      SELECT 
        i.*,
        u.username as assigned_to_username
      FROM client_inquiries i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE 1=1
    `;

    // Apply filters
    if (status) {
      query = sql`
        SELECT 
          i.*,
          u.username as assigned_to_username
        FROM client_inquiries i
        LEFT JOIN users u ON i.assigned_to = u.id
        WHERE i.status = ${status}
      `;
    }

    if (assigned_to) {
      query = sql`${query} AND i.assigned_to = ${parseInt(assigned_to)}`;
    }

    if (search) {
      query = sql`${query} AND (
        i.client_name ILIKE ${`%${search}%`} OR
        i.client_email ILIKE ${`%${search}%`} OR
        i.inquiry_number ILIKE ${`%${search}%`} OR
        i.event_type ILIKE ${`%${search}%`}
      )`;
    }

    const inquiriesResult = await sql`
      SELECT 
        i.*,
        u.username as assigned_to_username
      FROM client_inquiries i
      LEFT JOIN users u ON i.assigned_to = u.id
      ${status ? sql`WHERE i.status = ${status}` : sql``}
      ${assigned_to ? sql`${status ? sql`AND` : sql`WHERE`} i.assigned_to = ${parseInt(assigned_to)}` : sql``}
      ${search ? sql`${status || assigned_to ? sql`AND` : sql`WHERE`} (
        i.client_name ILIKE ${`%${search}%`} OR
        i.client_email ILIKE ${`%${search}%`} OR
        i.inquiry_number ILIKE ${`%${search}%`} OR
        i.event_type ILIKE ${`%${search}%`}
      )` : sql``}
      ORDER BY i.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const inquiries = normalizeRows(inquiriesResult);

    // Get total count
    const countQueryResult = await sql`
      SELECT COUNT(*) as total
      FROM client_inquiries i
      ${status ? sql`WHERE i.status = ${status}` : sql``}
      ${assigned_to ? sql`${status ? sql`AND` : sql`WHERE`} i.assigned_to = ${parseInt(assigned_to)}` : sql``}
      ${search ? sql`${status || assigned_to ? sql`AND` : sql`WHERE`} (
        i.client_name ILIKE ${`%${search}%`} OR
        i.client_email ILIKE ${`%${search}%`} OR
        i.inquiry_number ILIKE ${`%${search}%`} OR
        i.event_type ILIKE ${`%${search}%`}
      )` : sql``}
    `;
    const countResult = normalizeRows(countQueryResult);

    return NextResponse.json({
      success: true,
      inquiries,
      total: parseInt(countResult[0].total),
      limit,
      offset
    });

  } catch (error: any) {
    console.error('Get inquiries error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
