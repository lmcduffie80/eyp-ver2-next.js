'use server';

import sql from '@/api-old/db/connection';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

export async function updateInquiryStatus(id: number, status: string) {
  try {
    await requireAuth();

    await sql`
      UPDATE client_inquiries
      SET status = ${status}
      WHERE id = ${id}
    `;
    
    revalidatePath('/crm-admin/inquiries');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating inquiry status:', error);
    return { error: error.message || 'Failed to update status' };
  }
}

export async function updateInquiry(id: number, updates: any) {
  try {
    await requireAuth();

    const updateFields: any = {};
    if (updates.status !== undefined) updateFields.status = updates.status;
    if (updates.assigned_to !== undefined) updateFields.assigned_to = updates.assigned_to;
    if (updates.priority !== undefined) updateFields.priority = updates.priority;
    if (updates.last_contacted_at !== undefined) updateFields.last_contacted_at = updates.last_contacted_at;

    if (Object.keys(updateFields).length === 0) {
      return { error: 'No fields to update' };
    }

    await sql`
      UPDATE client_inquiries
      SET ${sql(updateFields, ...Object.keys(updateFields))}
      WHERE id = ${id}
    `;

    revalidatePath('/crm-admin/inquiries');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating inquiry:', error);
    return { error: error.message || 'Failed to update inquiry' };
  }
}

export async function deleteInquiry(id: number) {
  try {
    await requireAuth();

    await sql`
      DELETE FROM client_inquiries
      WHERE id = ${id}
    `;

    revalidatePath('/crm-admin/inquiries');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting inquiry:', error);
    return { error: error.message || 'Failed to delete inquiry' };
  }
}
