'use client';

import { useState } from 'react';
import { PageShell } from './PageShell';

interface Details {
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  djUser: string;
}

export default function ConfirmClient({
  token,
  details,
}: {
  token: string;
  details: Details;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submit() {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/dj-confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setStatus('error');
        setErrorMsg(body.error ?? 'Something went wrong. Please reply to the email.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please reply to the email.');
    }
  }

  if (status === 'done') {
    return (
      <PageShell headline="You're locked in — thanks!" tone="success">
        <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
          Lee has been notified that you'll be there for <strong>{details.title}</strong> on {details.date}.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{details.title}</div>
          <div style={cardMetaStyle}>
            {details.date}
            {details.time ? ` · ${details.time}` : ''}
          </div>
          {details.location && <div style={cardMetaMutedStyle}>{details.location}</div>}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell headline={`Confirm ${details.title}?`} tone="accent">
      <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>
        Tap the button below to confirm you'll be at this project. Lee will be notified right away.
      </p>
      <div style={cardStyle}>
        <div style={cardTitleStyle}>{details.title}</div>
        <div style={cardMetaStyle}>
          {details.date}
          {details.time ? ` · ${details.time}` : ''}
        </div>
        {details.location && <div style={cardMetaMutedStyle}>{details.location}</div>}
      </div>
      <button
        onClick={submit}
        disabled={status === 'loading'}
        style={{
          marginTop: 20,
          background: '#f97316',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '14px 28px',
          fontSize: 16,
          fontWeight: 600,
          cursor: status === 'loading' ? 'progress' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
        }}
      >
        {status === 'loading' ? 'Confirming…' : "Confirm I'll be there"}
      </button>
      {status === 'error' && errorMsg && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#991b1b',
            borderRadius: 8,
            fontSize: 14,
          }}
          role="alert"
        >
          {errorMsg}
        </div>
      )}
    </PageShell>
  );
}

const cardStyle: React.CSSProperties = {
  marginTop: 20,
  padding: '14px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#fafafa',
};
const cardTitleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#111827' };
const cardMetaStyle: React.CSSProperties = { fontSize: 14, color: '#374151', marginTop: 6 };
const cardMetaMutedStyle: React.CSSProperties = { fontSize: 13, color: '#6b7280', marginTop: 4 };
