'use server';

import sql from '@/api-old/db/connection';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';

export async function createMeetingNote(formData: FormData) {
  try {
    const user = await requireAuth();

    const project_id = parseInt(formData.get('project_id') as string);
    const meeting_title = formData.get('meeting_title') as string;
    const meeting_date = formData.get('meeting_date') as string;
    const meeting_type = formData.get('meeting_type') as string;
    const notes = formData.get('notes') as string;
    const visible_to_client = formData.get('visible_to_client') === 'true';

    if (!project_id || !meeting_title || !notes) {
      return { error: 'Project ID, title, and notes are required' };
    }

    // Get client_id from project
    const projectsResult = await sql`
      SELECT client_id FROM projects WHERE id = ${project_id} LIMIT 1
    `;

    const projects = projectsResult.rows || projectsResult;

    if (!projects || projects.length === 0) {
      return { error: 'Project not found' };
    }

    const noteResult = await sql`
      INSERT INTO meeting_notes (
        project_id,
        client_id,
        created_by,
        meeting_title,
        meeting_date,
        meeting_type,
        notes,
        action_items,
        visible_to_client
      ) VALUES (
        ${project_id},
        ${projects[0].client_id},
        ${user.id},
        ${meeting_title},
        ${meeting_date || new Date()},
        ${meeting_type || 'other'},
        ${notes},
        '[]',
        ${visible_to_client}
      )
      RETURNING *
    `;

    const result = noteResult.rows || noteResult;

    revalidatePath(`/crm-admin/projects/${project_id}`);
    return { success: true, note: result[0] };
  } catch (error: any) {
    console.error('Error creating meeting note:', error);
    return { error: error.message || 'Failed to create note' };
  }
}

export async function updateMeetingNote(noteId: number, updates: any) {
  try {
    await requireAuth();

    const updateFields: any = {};
    if (updates.meeting_title !== undefined) updateFields.meeting_title = updates.meeting_title;
    if (updates.notes !== undefined) updateFields.notes = updates.notes;
    if (updates.visible_to_client !== undefined) updateFields.visible_to_client = updates.visible_to_client;
    if (updates.action_items !== undefined) updateFields.action_items = updates.action_items;

    if (Object.keys(updateFields).length === 0) {
      return { error: 'No fields to update' };
    }

    await sql`
      UPDATE meeting_notes
      SET ${sql(updateFields, ...Object.keys(updateFields))}
      WHERE id = ${noteId}
    `;

    revalidatePath('/crm-admin/projects');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating note:', error);
    return { error: error.message || 'Failed to update note' };
  }
}
