import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats } from '@/lib/data/stats';
import DashboardClient from '@/components/crm/DashboardClient';

export const metadata: Metadata = {
  title: 'CRM Dashboard | Externally Yours Productions',
  description: 'Manage your clients, inquiries, and projects',
};

// Mark route as dynamic since it uses cookies for auth
export const dynamic = 'force-dynamic';

export default async function CRMDashboard() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/crm-admin/login');
  }

  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardClient stats={stats} />
    </div>
  );
}
