'use server';

import sql from '@/api-old/db/connection';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

export async function createProject(formData: FormData) {
  try {
    await requireAuth();

    const client_id = parseInt(formData.get('client_id') as string);
    const project_name = formData.get('project_name') as string;
    const event_type = formData.get('event_type') as string;
    const event_date = formData.get('event_date') as string;
    const total_amount = parseFloat(formData.get('total_amount') as string) || 0;
    const deposit_amount = parseFloat(formData.get('deposit_amount') as string) || 0;

    if (!client_id || !project_name) {
      return { error: 'Client ID and project name are required' };
    }

    const projectResult = await sql`
      INSERT INTO projects (
        project_number,
        client_id,
        project_name,
        event_type,
        event_date,
        total_amount,
        deposit_amount,
        final_payment_amount,
        stage,
        stage_updated_at
      ) VALUES (
        '',
        ${client_id},
        ${project_name},
        ${event_type || null},
        ${event_date || null},
        ${total_amount},
        ${deposit_amount},
        ${total_amount - deposit_amount},
        'inquiry',
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;

    const result = projectResult.rows || projectResult;

    revalidatePath('/crm-admin/projects');
    revalidatePath('/crm-admin/clients');
    return { success: true, project: result[0] };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return { error: error.message || 'Failed to create project' };
  }
}

export async function updateProjectStage(projectId: number, stage: string) {
  try {
    await requireAuth();

    await sql`
      UPDATE projects
      SET 
        stage = ${stage},
        stage_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${projectId}
    `;

    revalidatePath(`/crm-admin/projects/${projectId}`);
    revalidatePath('/crm-admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating project stage:', error);
    return { error: error.message || 'Failed to update stage' };
  }
}

export async function updateProject(projectId: number, updates: any) {
  try {
    await requireAuth();

    const updateFields: any = {};
    if (updates.project_name !== undefined) updateFields.project_name = updates.project_name;
    if (updates.event_type !== undefined) updateFields.event_type = updates.event_type;
    if (updates.event_date !== undefined) updateFields.event_date = updates.event_date;
    if (updates.event_location !== undefined) updateFields.event_location = updates.event_location;
    if (updates.total_amount !== undefined) updateFields.total_amount = updates.total_amount;
    if (updates.deposit_amount !== undefined) updateFields.deposit_amount = updates.deposit_amount;

    if (Object.keys(updateFields).length === 0) {
      return { error: 'No fields to update' };
    }

    await sql`
      UPDATE projects
      SET ${sql(updateFields, ...Object.keys(updateFields))}
      WHERE id = ${projectId}
    `;

    revalidatePath(`/crm-admin/projects/${projectId}`);
    revalidatePath('/crm-admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating project:', error);
    return { error: error.message || 'Failed to update project' };
  }
}
