import * as React from 'react';

// Shared visual chrome for every state of the DJ confirm flow.
// Kept in its own file so it can be used by both the server-rendered page
// (page.tsx) and the client-side confirm button (ConfirmClient.tsx).
export function PageShell({
  children,
  headline,
  tone = 'muted',
}: {
  children: React.ReactNode;
  headline: string;
  tone?: 'success' | 'muted' | 'accent';
}) {
  const accent = tone === 'success' ? '#16a34a' : tone === 'accent' ? '#f97316' : '#6b7280';
  const label =
    tone === 'success' ? 'CONFIRMED' : tone === 'accent' ? 'ACTION NEEDED' : 'INFO';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f4f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: '-apple-system, Segoe UI, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: '100%',
          background: '#ffffff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ background: '#111827', padding: '20px 24px', color: '#ffffff' }}>
          <div style={{ fontSize: 13, letterSpacing: 1, color: '#f97316', fontWeight: 600 }}>
            EXTERNALLY YOURS PRODUCTIONS
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>DJ Confirmation</div>
        </div>
        <div style={{ padding: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              color: accent,
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <h1 style={{ margin: '4px 0 16px 0', fontSize: 24, color: '#111827' }}>{headline}</h1>
          {children}
        </div>
      </div>
    </main>
  );
}
