'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Comment {
  id: number;
  authorType: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

interface ClientCommentsProps {
  token: string;
  blockId: number;
  accentColor?: string;
}

export default function ClientComments({ token, blockId, accentColor = '#4f46e5' }: ClientCommentsProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newBody, setNewBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/smart-files/public/${token}/comments?blockId=${blockId}`);
    const data = await res.json();
    if (data.success) setComments(data.data);
    setLoaded(true);
  }, [token, blockId]);

  useEffect(() => {
    if (open && !loaded) loadComments();
  }, [open, loaded, loadComments]);

  const post = async () => {
    if (!newBody.trim()) return;
    setPosting(true);
    await fetch(`/api/smart-files/public/${token}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockId, body: newBody.trim() }),
    });
    setNewBody('');
    setPosting(false);
    loadComments();
  };

  const unresolved = comments.filter((c) => !c.resolved);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {unresolved.length > 0 ? `${unresolved.length} comment${unresolved.length !== 1 ? 's' : ''}` : 'Add comment'}
      </button>

      {open && (
        <div className="mt-2 bg-gray-50 rounded-xl border border-gray-200 p-3 space-y-3">
          {loaded && unresolved.length > 0 && (
            <div className="space-y-2">
              {unresolved.map((c) => (
                <div key={c.id} className="bg-white rounded-lg border border-gray-100 p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.authorType === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{c.authorType === 'admin' ? 'From us' : 'You'}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.body}</p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-1.5">
            <textarea
              rows={2}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Leave a comment or question\u2026"
              className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none bg-white"
            />
            <button
              onClick={post}
              disabled={posting || !newBody.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              {posting ? 'Sending\u2026' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
