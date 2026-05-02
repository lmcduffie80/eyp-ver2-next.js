'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { SmartFile, SfFileStatus } from '@/lib/smartFiles/types';

const STATUS_COLORS: Record<SfFileStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  partial: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<SfFileStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partially Signed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function SmartFilesListPage() {
  const [files, setFiles] = useState<SmartFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (showTemplates) params.set('templates', 'true');
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('q', search);
      const res = await fetch(`/api/smart-files?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setFiles(data.data);
    } catch {
      setError('Failed to load Smart Files');
    } finally {
      setLoading(false);
    }
  }, [showTemplates, statusFilter, search]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/smart-files', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          clientName: newClientName,
          clientEmail: newClientEmail,
          eventDate: newEventDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        setNewClientName('');
        setNewClientEmail('');
        setNewEventDate('');
        setShowCreateForm(false);
        fetchFiles();
      } else {
        setError(data.error ?? 'Failed to create');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/smart-files/${id}`, { method: 'DELETE', credentials: 'include' });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      setError('Failed to delete');
    }
  };

  const runSetup = async () => {
    if (!confirm('Run database setup? Safe to run multiple times.')) return;
    try {
      const res = await fetch('/api/smart-files/setup', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      alert(data.success ? 'Schema created successfully!' : `Error: ${data.error}`);
    } catch {
      alert('Setup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-semibold text-gray-900">Smart Files</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSetup}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Run DB Setup
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              + New Smart File
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="search"
            placeholder="Search files or clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showTemplates}
              onChange={(e) => setShowTemplates(e.target.checked)}
              className="rounded"
            />
            Templates only
          </label>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">New Smart File</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Smith Wedding Contract"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Jane & John Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Email</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating…' : 'Create Smart File'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-3 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* File list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search || statusFilter ? 'No files match your filters.' : 'No Smart Files yet. Create your first one!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Status dot */}
                  <div className="pt-1">
                    <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${
                      file.status === 'completed' ? 'bg-green-500' :
                      file.status === 'sent' ? 'bg-blue-500' :
                      file.status === 'partial' ? 'bg-yellow-500' :
                      file.status === 'cancelled' ? 'bg-red-400' : 'bg-gray-300'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{file.title}</span>
                      {file.isTemplate && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          Template
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[file.status]}`}>
                        {STATUS_LABELS[file.status]}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 flex flex-wrap gap-3">
                      {file.clientName && <span>{file.clientName}</span>}
                      {file.clientEmail && <span>{file.clientEmail}</span>}
                      {file.eventDate && (
                        <span>{new Date(file.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                      <span className="text-gray-400">
                        Updated {new Date(file.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Link
                    href={`/admin/smart-files/${file.id}`}
                    className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(file.id, file.title)}
                    className="text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
