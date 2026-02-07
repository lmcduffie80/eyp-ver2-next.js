'use server';

import sql from '@/api-old/db/connection';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function createClient(formData: FormData) {
  try {
    await requireAuth();

    const client_name = formData.get('client_name') as string;
    const client_email = formData.get('client_email') as string;
    const client_phone = formData.get('client_phone') as string;
    const client_company = formData.get('client_company') as string;
    const create_portal_access = formData.get('create_portal_access') === 'true';

    if (!client_name || !client_email) {
      return { error: 'Name and email are required' };
    }

    // Check if client exists
    const existingResult = await sql`
      SELECT id FROM clients WHERE client_email = ${client_email} LIMIT 1
    `;

    const existing = existingResult.rows || existingResult;

    if (existing && existing.length > 0) {
      return { error: 'Client with this email already exists' };
    }

    // Generate portal access if requested
    let portalPassword = null;
    let portalActivationToken = null;
    
    if (create_portal_access) {
      portalActivationToken = Buffer.from(`${client_email}:${Date.now()}:${Math.random()}`).toString('base64');
      const tempPassword = Math.random().toString(36).slice(-10);
      portalPassword = await bcrypt.hash(tempPassword, 10);
    }

    const insertResult = await sql`
      INSERT INTO clients (
        client_number,
        client_name,
        client_email,
        client_phone,
        client_company,
        preferred_contact_method,
        portal_password,
        portal_activation_token
      ) VALUES (
        '',
        ${client_name},
        ${client_email},
        ${client_phone || null},
        ${client_company || null},
        'email',
        ${portalPassword},
        ${portalActivationToken}
      )
      RETURNING *
    `;

    const result = insertResult.rows || insertResult;

    revalidatePath('/crm-admin/clients');
    return { success: true, client: result[0] };
  } catch (error: any) {
    console.error('Error creating client:', error);
    return { error: error.message || 'Failed to create client' };
  }
}

export async function updateClient(id: number, updates: any) {
  try {
    await requireAuth();

    const updateFields: any = {};
    if (updates.client_name !== undefined) updateFields.client_name = updates.client_name;
    if (updates.client_email !== undefined) updateFields.client_email = updates.client_email;
    if (updates.client_phone !== undefined) updateFields.client_phone = updates.client_phone;
    if (updates.client_company !== undefined) updateFields.client_company = updates.client_company;

    if (Object.keys(updateFields).length === 0) {
      return { error: 'No fields to update' };
    }

    await sql`
      UPDATE clients
      SET ${sql(updateFields, ...Object.keys(updateFields))}
      WHERE id = ${id}
    `;

    revalidatePath('/crm-admin/clients');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating client:', error);
    return { error: error.message || 'Failed to update client' };
  }
}
