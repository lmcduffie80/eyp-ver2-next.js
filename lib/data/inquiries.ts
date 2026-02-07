import sql from '@/api-old/db/connection';
import { cache } from 'react';
import { normalizeRows } from '@/lib/db-utils';

export interface Inquiry {
  id: number;
  inquiry_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  event_type: string;
  event_date: string;
  event_location: string;
  guest_count: number;
  services_requested: string[];
  budget_range: string;
  message: string;
  status: string;
  priority: string;
  assigned_to: number | null;
  assigned_to_username: string | null;
  referral_source: string;
  created_at: string;
  updated_at: string;
}

export const getInquiries = cache(async (filters?: {
  status?: string;
  assigned_to?: number;
  search?: string;
}): Promise<Inquiry[]> => {
  try {
    let query = sql`
      SELECT 
        i.*,
        u.username as assigned_to_username
      FROM client_inquiries i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE 1=1
    `;

    if (filters?.status) {
      query = sql`${query} AND i.status = ${filters.status}`;
    }

    if (filters?.assigned_to) {
      query = sql`${query} AND i.assigned_to = ${filters.assigned_to}`;
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = sql`${query} AND (
        i.client_name ILIKE ${searchTerm} OR
        i.client_email ILIKE ${searchTerm} OR
        i.inquiry_number ILIKE ${searchTerm} OR
        i.event_type ILIKE ${searchTerm}
      )`;
    }

    const result = await sql`
      ${query}
      ORDER BY i.created_at DESC
      LIMIT 100
    `;

    return normalizeRows(result) as Inquiry[];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
});

export const getInquiryById = cache(async (id: number): Promise<Inquiry | null> => {
  try {
    const result = await sql`
      SELECT 
        i.*,
        u.username as assigned_to_username,
        u.email as assigned_to_email
      FROM client_inquiries i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
    const inquiries = normalizeRows(result);

    return inquiries.length > 0 ? (inquiries[0] as Inquiry) : null;
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return null;
  }
});
