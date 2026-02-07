'use server';

import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function crmLoginAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { error: 'Username and password are required' };
    }

    // Get user from database
    const result = await sql`
      SELECT * FROM users 
      WHERE username = ${username}
      LIMIT 1
    `;

    const users = result.rows || result;

    if (!users || users.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { error: 'Invalid credentials' };
    }

    // Create session token
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64');

    // Set cookies
    const cookieStore = await cookies();
    
    cookieStore.set('crm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    cookieStore.set('crm_user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

  } catch (error: any) {
    console.error('CRM login error:', error);
    return { error: 'Login failed' };
  }

  redirect('/crm-admin/dashboard');
}

export async function crmLogoutAction() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete('crm_session');
    cookieStore.delete('crm_user_id');

  } catch (error) {
    console.error('CRM logout error:', error);
  }

  redirect('/crm-admin/login');
}

export async function clientLoginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { error: 'Email and password are required' };
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
      return { error: 'Invalid credentials or portal not activated' };
    }

    const client = clients[0];

    if (!client.portal_password) {
      return { error: 'Please activate your portal account first' };
    }

    const passwordMatch = await bcrypt.compare(password, client.portal_password);

    if (!passwordMatch) {
      return { error: 'Invalid credentials' };
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

  } catch (error: any) {
    console.error('Client login error:', error);
    return { error: 'Login failed' };
  }

  redirect('/client-portal/dashboard');
}

export async function clientLogoutAction() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.delete('client_session');
    cookieStore.delete('client_id');

  } catch (error) {
    console.error('Client logout error:', error);
  }

  redirect('/client-portal/login');
}

export async function clientActivateAction(formData: FormData) {
  try {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;

    if (!token || !password) {
      return { error: 'Token and password are required' };
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
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
      return { error: 'Invalid or expired activation token' };
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

    return { success: true };

  } catch (error: any) {
    console.error('Client activation error:', error);
    return { error: 'Activation failed' };
  }
}
