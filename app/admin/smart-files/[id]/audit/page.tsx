'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { SfAuditEvent } from '@/lib/smartFiles/types';

const EVENT_ICONS: Record<string, string> = {
  file_created: '📄',
  file_updated: '✏️',
  file_cloned: '📋',
  file_fully_executed: '✅',
  share_sent: '📤',
  provider_signed: '✍️',
  client_signed: '✍️',
  answers_saved: '💬',
  payment_received: '💳',
  default: '•',
};

const ACTOR_COLORS: Record<string, string> = {
  admin: 'bg-blue-100 text-blue-700',
  client: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-600',
};

export default function AuditLogPage() {
  const params = useParams();
  const fileId = Number(params.id);

  const [events, setEvents] = useState<SfAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fileTitle, setFileTitle] = useState('');

  useEffect(() => {
    const load = async () => {
      const [auditRes, fileRes] = await Promise.all([
        fetch(`/api/smart-files/${fileId}/audit`, { credentials: 'include' }),
        fetch(`/api/smart-files/${fileId}`, { credentials: 'include' }),
      ]);
      const auditData = await auditRes.json();
      const fileData = await fileRes.json();
      if (auditData.success) setEvents(auditData.data);
      if (fileData.success) setFileTitle(fileData.data.title);
      setLoading(false);
    };
    load();
  }, [fileId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href={`/admin/smart-files/${fileId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Back to file</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-semibold text-gray-900">Audit Log</h1>
          {fileTitle && <span className="text-gray-500 text-sm">— {fileTitle}</span>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No audit events yet.</div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {events.map((event, idx) => (
                <div key={event.id} className="relative flex items-start gap-4 pl-14">
                  {/* Icon circle */}
                  <div className="absolute left-3 w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm z-10">
                    {EVENT_ICONS[event.event] ?? EVENT_ICONS.default}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {event.event.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTOR_COLORS[event.actorType] ?? ACTOR_COLORS.system}`}>
                        {event.actorType}
                      </span>
                      {event.actorId && (
                        <span className="text-xs text-gray-500">{event.actorId}</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(event.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: 'numeric', minute: '2-digit', hour12: true
                      })}
                      {event.ip && <span className="ml-3 text-gray-400">IP: {event.ip}</span>}
                    </div>

                    {Object.keys(event.payload).length > 0 && (
                      <details className="text-xs">
                        <summary className="text-gray-400 cursor-pointer hover:text-gray-600">Details</summary>
                        <pre className="mt-2 bg-gray-50 rounded p-2 text-gray-600 overflow-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
