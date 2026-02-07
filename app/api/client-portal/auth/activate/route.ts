import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/api-old/db/connection';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({
        success: false,
        message: 'Token and password are required'
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters'
      }, { status: 400 });
    }

    // Find client by activation token
    const result = await sql`
      SELECT * FROM clients 
      WHERE portal_activation_token = ${token}
      AND portal_activated = false
      LIMIT 1
    `;

    const clients = result.rows || result;

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired activation token'
      }, { status: 404 });
    }

    const client = clients[0];

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update client: activate portal and set password
    await sql`
      UPDATE clients
      SET 
        portal_password = ${hashedPassword},
        portal_activated = true,
        portal_activation_token = NULL
      WHERE id = ${client.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Portal activated successfully',
      client: {
        id: client.id,
        client_name: client.client_name,
        client_email: client.client_email
      }
    });

  } catch (error: any) {
    console.error('Client activation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Activation failed'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token is required'
      }, { status: 400 });
    }

    // Verify token exists
    const result = await sql`
      SELECT id, client_name, client_email, portal_activated
      FROM clients 
      WHERE portal_activation_token = ${token}
      LIMIT 1
    `;

    const clients = result.rows || result;

    if (!clients || clients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired activation token'
      }, { status: 404 });
    }

    const client = clients[0];

    if (client.portal_activated) {
      return NextResponse.json({
        success: false,
        message: 'Portal already activated'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        client_name: client.client_name,
        client_email: client.client_email
      }
    });

  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Verification failed'
    }, { status: 500 });
  }
}
