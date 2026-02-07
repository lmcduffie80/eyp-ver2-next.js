import sql from '@/api-old/db/connection';
import { cache } from 'react';
import { normalizeRows } from '@/lib/db-utils';

export interface Project {
  id: number;
  project_number: string;
  project_name: string;
  client_id: number;
  client_name: string;
  client_email: string;
  event_type: string;
  event_date: string;
  event_location: string;
  stage: string;
  total_amount: number;
  deposit_paid: boolean;
  final_payment_paid: boolean;
  contract_signed: boolean;
  assigned_to_username: string;
  created_at: string;
}

export const getProjects = cache(async (filters?: {
  stage?: string;
  client_id?: number;
  search?: string;
}): Promise<Project[]> => {
  try {
    let query = sql`
      SELECT 
        p.*,
        c.client_name,
        c.client_email,
        u.username as assigned_to_username
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.assigned_to = u.id
      WHERE 1=1
    `;

    if (filters?.stage) {
      query = sql`${query} AND p.stage = ${filters.stage}`;
    }

    if (filters?.client_id) {
      query = sql`${query} AND p.client_id = ${filters.client_id}`;
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = sql`${query} AND (
        p.project_name ILIKE ${searchTerm} OR
        p.project_number ILIKE ${searchTerm} OR
        c.client_name ILIKE ${searchTerm}
      )`;
    }

    const result = await sql`
      ${query}
      ORDER BY p.created_at DESC
    `;

    return normalizeRows(result) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
});

export const getProjectById = cache(async (id: number) => {
  try {
    const projectsResult = await sql`
      SELECT 
        p.*,
        c.client_name,
        c.client_email,
        c.client_phone,
        u.username as assigned_to_username
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.assigned_to = u.id
      WHERE p.id = ${id}
      LIMIT 1
    `;
    const projects = normalizeRows(projectsResult);

    if (projects.length === 0) {
      return null;
    }

    // Get related data
    const [contractsResult, paymentsResult, invoicesResult, notesResult] = await Promise.all([
      sql`SELECT * FROM contracts WHERE project_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT * FROM payments WHERE project_id = ${id} ORDER BY transaction_date DESC`,
      sql`SELECT * FROM invoices WHERE project_id = ${id} ORDER BY invoice_date DESC`,
      sql`
        SELECT n.*, u.username as created_by_username
        FROM meeting_notes n
        LEFT JOIN users u ON n.created_by = u.id
        WHERE n.project_id = ${id}
        ORDER BY n.meeting_date DESC
      `,
    ]);

    return {
      project: projects[0],
      contracts: normalizeRows(contractsResult),
      payments: normalizeRows(paymentsResult),
      invoices: normalizeRows(invoicesResult),
      notes: normalizeRows(notesResult),
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
});
