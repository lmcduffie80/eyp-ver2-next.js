'use client';

import { useEffect, useRef, useState } from 'react';
import { ADMIN_IDLE_TIMEOUT_MS, ADMIN_HEARTBEAT_MS } from '@/lib/adminSession';

// Shared across tabs so activity in one admin tab keeps the others signed in.
const LAST_ACTIVITY_KEY = 'admin_last_activity';
const WARNING_MS = 60 * 1000;
const CHECK_INTERVAL_MS = 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;

function readLastActivity(): number {
  const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
}

export default function AdminIdleTimeout() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const lastHeartbeat = useRef(Date.now());
  const loggingOut = useRef(false);

  useEffect(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));

    const logout = async (reason: 'timeout' | 'expired') => {
      if (loggingOut.current) return;
      loggingOut.current = true;
      try {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      } catch {
        // Redirect regardless; the server rejects idle sessions on its own.
      }
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_display_name');
      window.location.href = `/admin-login?reason=${reason}`;
    };

    const heartbeat = async () => {
      lastHeartbeat.current = Date.now();
      try {
        const res = await fetch('/api/admin-verify', { credentials: 'include' });
        if (res.status === 401) logout('expired');
      } catch {
        // Network blip: try again on the next heartbeat.
      }
    };

    let lastRecorded = 0;
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastRecorded < 1000) return;
      lastRecorded = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    };

    const check = () => {
      if (loggingOut.current) return;
      const lastActivity = readLastActivity();
      const idleFor = Date.now() - lastActivity;
      const remaining = ADMIN_IDLE_TIMEOUT_MS - idleFor;

      if (remaining <= 0) {
        logout('timeout');
        return;
      }

      setSecondsLeft(remaining <= WARNING_MS ? Math.ceil(remaining / 1000) : null);

      if (lastActivity > lastHeartbeat.current && Date.now() - lastHeartbeat.current >= ADMIN_HEARTBEAT_MS) {
        heartbeat();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    document.addEventListener('visibilitychange', check);
    const interval = window.setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, recordActivity));
      document.removeEventListener('visibilitychange', check);
      window.clearInterval(interval);
    };
  }, []);

  if (secondsLeft === null) return null;

  return (
    <div className="idle-warning" role="alertdialog" aria-live="assertive">
      <p>
        You&apos;ve been inactive. For security, you&apos;ll be logged out in{' '}
        <strong>{secondsLeft}s</strong>.
      </p>
      <button type="button" onClick={() => localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))}>
        Stay signed in
      </button>

      <style jsx>{`
        .idle-warning {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 10000;
          max-width: 340px;
          background: #1a1a1a;
          color: white;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          border-left: 4px solid #ff6b35;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .idle-warning p {
          margin: 0 0 0.75rem;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .idle-warning button {
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-weight: bold;
          cursor: pointer;
        }

        .idle-warning button:hover {
          background: #e55a2b;
        }
      `}</style>
    </div>
  );
}
