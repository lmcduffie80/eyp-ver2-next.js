import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Get client from database
    const result = await sql`
      SELECT * FROM clients 
      WHERE client_email = ${email}
      AND portal_activated = true
      LIMIT 1
    `;

    const clients = result.rows || result;

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials or portal not activated'
      }, { status: 401 });
    }

    const client = clients[0];

    // Verify password
    if (!client.portal_password) {
      return NextResponse.json({
        success: false,
        message: 'Please activate your portal account first'
      }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, client.portal_password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create session token
    const sessionToken = Buffer.from(`${client.id}:${Date.now()}:${Math.random()}`).toString('base64');

    // Set cookies
    const cookieStore = await cookies();
    
    cookieStore.set('client_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    cookieStore.set('client_id', client.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    // Update last login
    await sql`
      UPDATE clients
      SET portal_last_login = CURRENT_TIMESTAMP
      WHERE id = ${client.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      client: {
        id: client.id,
        client_name: client.client_name,
        client_email: client.client_email
      }
    });

  } catch (error: any) {
    console.error('Client login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 });
  }
}
