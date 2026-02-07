import sql from '@/api-old/db/connection';
import { cache } from 'react';
import { normalizeRows } from '@/lib/db-utils';

export interface DashboardStats {
  total_inquiries: number;
  new_inquiries: number;
  active_projects: number;
  total_clients: number;
  pending_contracts: number;
  total_revenue: number;
}

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  try {
    // Get inquiry stats
    const inquiryStatsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count
      FROM client_inquiries
    `;
    const inquiryStats = normalizeRows(inquiryStatsResult);

    // Get client count
    const clientStatsResult = await sql`
      SELECT COUNT(*) as total
      FROM clients
    `;
    const clientStats = normalizeRows(clientStatsResult);

    // Get project stats
    const projectStatsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_archived = false AND stage NOT IN ('completed', 'archived')) as active
      FROM projects
    `;
    const projectStats = normalizeRows(projectStatsResult);

    // Get pending contracts
    const contractStatsResult = await sql`
      SELECT COUNT(*) as total
      FROM contracts
      WHERE status IN ('draft', 'sent', 'viewed')
    `;
    const contractStats = normalizeRows(contractStatsResult);

    // Get revenue
    const revenueStatsResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE status = 'completed'
    `;
    const revenueStats = normalizeRows(revenueStatsResult);

    return {
      total_inquiries: Number(inquiryStats[0]?.total || 0),
      new_inquiries: Number(inquiryStats[0]?.new_count || 0),
      active_projects: Number(projectStats[0]?.active || 0),
      total_clients: Number(clientStats[0]?.total || 0),
      pending_contracts: Number(contractStats[0]?.total || 0),
      total_revenue: Number(revenueStats[0]?.total || 0),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values on error
    return {
      total_inquiries: 0,
      new_inquiries: 0,
      active_projects: 0,
      total_clients: 0,
      pending_contracts: 0,
      total_revenue: 0,
    };
  }
});
