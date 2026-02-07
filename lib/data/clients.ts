import sql from '@/api-old/db/connection';
import { cache } from 'react';
import { normalizeRows } from '@/lib/db-utils';

export interface Client {
  id: number;
  client_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_company: string;
  portal_activated: boolean;
  portal_last_login: string;
  project_count: number;
  created_at: string;
  updated_at: string;
}

export const getClients = cache(async (search?: string): Promise<Client[]> => {
  try {
    let result;
    
    if (search) {
      result = await sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM projects WHERE client_id = c.id) as project_count
        FROM clients c
        WHERE c.client_name ILIKE ${`%${search}%`}
           OR c.client_email ILIKE ${`%${search}%`}
           OR c.client_number ILIKE ${`%${search}%`}
        ORDER BY c.created_at DESC
      `;
    } else {
      result = await sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM projects WHERE client_id = c.id) as project_count
        FROM clients c
        ORDER BY c.created_at DESC
      `;
    }

    return normalizeRows(result) as Client[];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
});

export const getClientById = cache(async (id: number) => {
  try {
    const clientsResult = await sql`
      SELECT * FROM clients WHERE id = ${id} LIMIT 1
    `;
    const clients = normalizeRows(clientsResult);

    if (clients.length === 0) {
      return null;
    }

    // Get client projects
    const projectsResult = await sql`
      SELECT * FROM projects 
      WHERE client_id = ${id}
      ORDER BY created_at DESC
    `;
    const projects = normalizeRows(projectsResult);

    return {
      client: clients[0],
      projects,
    };
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
});
