import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import { normalizeRows } from '@/lib/db-utils';

async function verifyClientAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('client_session');
  const clientId = cookieStore.get('client_id');
  
  if (!session || !clientId) {
    return null;
  }
  
  return clientId.value;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = await verifyClientAuth();
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = parseInt(params.id);

    // Get contract with project info - ensure it belongs to this client
    const result = await sql`
      SELECT 
        c.*,
        p.project_name,
        p.event_type,
        p.event_date,
        p.event_location,
        cl.client_name,
        cl.client_email
      FROM contracts c
      JOIN projects p ON c.project_id = p.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = ${contractId}
        AND c.client_id = ${clientId}
      LIMIT 1
    `;

    const contracts = normalizeRows(result);

    if (contracts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found or access denied'
      }, { status: 404 });
    }

    const contract = contracts[0];

    // Update viewed_at if not already viewed
    if (!contract.viewed_at && contract.status === 'sent') {
      await sql`
        UPDATE contracts
        SET viewed_at = CURRENT_TIMESTAMP
        WHERE id = ${contractId}
      `;
    }

    return NextResponse.json({
      success: true,
      contract
    });

  } catch (error: any) {
    console.error('Get contract error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
