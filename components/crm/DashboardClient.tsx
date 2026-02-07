'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardStats } from '@/lib/data/stats';

interface DashboardClientProps {
  stats: DashboardStats;
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/crm-admin/logout', { method: 'POST' });
    router.push('/crm-admin/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="top-bar bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold m-0">CRM Dashboard</h1>
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={() => router.push('/crm-admin/inquiries')}
              className="px-5 py-2.5 rounded-lg border-none bg-orange-500 text-white font-semibold transition-all hover:bg-orange-600 cursor-pointer"
            >
              Inquiries
            </button>
            <button
              onClick={() => router.push('/crm-admin/clients')}
              className="px-5 py-2.5 rounded-lg border-none bg-orange-500 text-white font-semibold transition-all hover:bg-orange-600 cursor-pointer"
            >
              Clients
            </button>
            <button
              onClick={() => router.push('/crm-admin/projects')}
              className="px-5 py-2.5 rounded-lg border-none bg-orange-500 text-white font-semibold transition-all hover:bg-orange-600 cursor-pointer"
            >
              Projects
            </button>
            <button
              onClick={() => router.push('/crm-admin/contracts/templates')}
              className="px-5 py-2.5 rounded-lg border-none bg-orange-500 text-white font-semibold transition-all hover:bg-orange-600 cursor-pointer"
            >
              Templates
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg border-none bg-white/10 text-white font-semibold transition-all hover:bg-white/20 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-15 h-15 rounded-xl bg-orange-100 flex items-center justify-center text-3xl">
              📬
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-3xl font-bold text-gray-900">{stats.total_inquiries}</h3>
              <p className="m-0 text-gray-600 text-sm">Total Inquiries</p>
              {stats.new_inquiries > 0 && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white rounded-xl text-xs font-semibold">
                  +{stats.new_inquiries} new
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-15 h-15 rounded-xl bg-blue-100 flex items-center justify-center text-3xl">
              👥
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-3xl font-bold text-gray-900">{stats.total_clients}</h3>
              <p className="m-0 text-gray-600 text-sm">Total Clients</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-15 h-15 rounded-xl bg-indigo-100 flex items-center justify-center text-3xl">
              📋
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-3xl font-bold text-gray-900">{stats.active_projects}</h3>
              <p className="m-0 text-gray-600 text-sm">Active Projects</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="w-15 h-15 rounded-xl bg-yellow-100 flex items-center justify-center text-3xl">
              📄
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-3xl font-bold text-gray-900">{stats.pending_contracts}</h3>
              <p className="m-0 text-gray-600 text-sm">Pending Contracts</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-5 items-center transition-all hover:-translate-y-1 hover:shadow-md col-span-1">
            <div className="w-15 h-15 rounded-xl bg-green-100 flex items-center justify-center text-3xl">
              💰
            </div>
            <div className="flex-1">
              <h3 className="m-0 mb-1 text-3xl font-bold text-gray-900">
                {formatCurrency(stats.total_revenue)}
              </h3>
              <p className="m-0 text-gray-600 text-sm">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-gray-900 m-0 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/crm-admin/inquiries')}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer border-2 border-transparent transition-all hover:border-orange-500 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-5xl">📬</span>
              <span className="text-gray-900 font-semibold text-base">View Inquiries</span>
            </button>

            <button
              onClick={() => router.push('/crm-admin/clients')}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer border-2 border-transparent transition-all hover:border-orange-500 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-5xl">➕</span>
              <span className="text-gray-900 font-semibold text-base">Add Client</span>
            </button>

            <button
              onClick={() => router.push('/crm-admin/projects')}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer border-2 border-transparent transition-all hover:border-orange-500 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-5xl">📋</span>
              <span className="text-gray-900 font-semibold text-base">Manage Projects</span>
            </button>

            <button
              onClick={() => router.push('/crm-admin/contracts/templates')}
              className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer border-2 border-transparent transition-all hover:border-orange-500 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-5xl">📝</span>
              <span className="text-gray-900 font-semibold text-base">Contract Templates</span>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-10 rounded-xl text-center">
          <h2 className="m-0 mb-4 text-3xl">Welcome to Your CRM</h2>
          <p className="m-0 mb-3 text-lg opacity-95 leading-relaxed">
            This client management system helps you manage inquiries, contracts, payments, and projects all in one place.
          </p>
          <p className="m-0 text-lg opacity-95 leading-relaxed">
            Get started by reviewing new inquiries or creating a contract for an existing client.
          </p>
        </div>
      </div>
    </>
  );
}
