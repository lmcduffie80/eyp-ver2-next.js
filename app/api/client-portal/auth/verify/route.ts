import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('client_session');
    const clientId = cookieStore.get('client_id');

    if (!session || !clientId) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 });
    }

    // Get client from database
    const result = await sql`
      SELECT id, client_name, client_email, portal_activated
      FROM clients 
      WHERE id = ${parseInt(clientId.value)}
      AND portal_activated = true
      LIMIT 1
    `;

    const clients = result.rows || result;

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 });
    }

    const client = clients[0];

    return NextResponse.json({
      authenticated: true,
      client: {
        id: client.id,
        client_name: client.client_name,
        client_email: client.client_email
      }
    });

  } catch (error) {
    console.error('Client verify error:', error);
    return NextResponse.json({
      authenticated: false
    }, { status: 500 });
  }
}
