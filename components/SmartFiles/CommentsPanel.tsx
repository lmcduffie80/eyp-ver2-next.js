'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Comment {
  id: number;
  fileId: number;
  blockId: number | null;
  authorType: string;
  authorId: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

interface CommentsPanelProps {
  fileId: number;
  blockId?: number | null;
  title?: string;
}

export default function CommentsPanel({ fileId, blockId = null, title }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const fetch_ = useCallback(async () => {
    const params = new URLSearchParams();
    if (blockId != null) params.set('blockId', String(blockId));
    const res = await fetch(`/api/smart-files/${fileId}/comments?${params}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) setComments(data.data);
    setLoading(false);
  }, [fileId, blockId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const post = async () => {
    if (!newBody.trim()) return;
    setPosting(true);
    await fetch(`/api/smart-files/${fileId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newBody.trim(), blockId }),
    });
    setNewBody('');
    setPosting(false);
    fetch_();
  };

  const resolve = async (id: number, resolved: boolean) => {
    await fetch(`/api/smart-files/${fileId}/comments`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId: id, resolved }),
    });
    fetch_();
  };

  const visible = comments.filter((c) => showResolved || !c.resolved);
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title ?? (blockId ? 'Block Comments' : 'All Comments')}</div>
          {unresolvedCount > 0 && <div className="text-xs text-gray-400">{unresolvedCount} open</div>}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="rounded" />
          Show resolved
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="text-xs text-gray-400 text-center py-4">Loading\u2026</div>
        ) : visible.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">No comments yet.</div>
        ) : (
          visible.map((c) => (
            <div key={c.id} className={`rounded-lg border p-3 ${c.resolved ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.authorType === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{c.authorType}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
                {c.resolved ? (
                  <button onClick={() => resolve(c.id, false)} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">Reopen</button>
                ) : (
                  <button onClick={() => resolve(c.id, true)} className="text-xs text-green-600 hover:text-green-800 shrink-0">\u2713 Resolve</button>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 shrink-0">
        <textarea
          rows={2}
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) post(); }}
          placeholder="Add a comment\u2026 (\u2318\u23CE to send)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
        />
        <button
          onClick={post}
          disabled={posting || !newBody.trim()}
          className="mt-2 w-full bg-gray-900 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {posting ? 'Posting\u2026' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}
