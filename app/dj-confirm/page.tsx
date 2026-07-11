import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { verifyConfirmToken } from '@/lib/dj-notifications/token';
import { formatEventDate } from '@/lib/dj-notifications/schedule';
import ConfirmClient from './ConfirmClient';
import { PageShell } from './PageShell';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { token?: string };
}

function projectTitle(clientName: string | null, eventType: string | null): string {
  const c = clientName?.trim();
  const t = eventType?.trim();
  if (c && t) return `${c} — ${t}`;
  return c || t || 'your upcoming project';
}

export default async function DjConfirmPage({ searchParams }: PageProps) {
  const token = searchParams?.token ?? '';
  const payload = token ? verifyConfirmToken(token) : null;

  if (!payload) {
    return <ConfirmScreen state="invalid" />;
  }

  const bookingRows = normalizeRows(await sql`
    SELECT id, client_name, event_type, date, time, location
    FROM bookings WHERE id = ${payload.bookingId} LIMIT 1
  `);

  if (bookingRows.length === 0) {
    return <ConfirmScreen state="not_found" />;
  }
  const b = bookingRows[0];

  const alreadyConfirmed = normalizeRows(await sql`
    SELECT confirmed_at FROM dj_confirmations
    WHERE booking_id = ${payload.bookingId} AND dj_user = ${payload.djUser}
    LIMIT 1
  `);

  const details = {
    title: projectTitle(b.client_name, b.event_type),
    date: formatEventDate(b.date),
    time: b.time as string | null,
    location: b.location as string | null,
    djUser: payload.djUser,
  };

  if (alreadyConfirmed.length > 0) {
    return <ConfirmScreen state="already" details={details} />;
  }

  return <ConfirmClient token={token} details={details} />;
}

interface Details {
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  djUser: string;
}

function ConfirmScreen({
  state,
  details,
}: {
  state: 'invalid' | 'not_found' | 'already';
  details?: Details;
}) {
  const headline =
    state === 'invalid' ? 'Link expired or invalid'
    : state === 'not_found' ? 'Booking not found'
    : 'You already confirmed';

  const body =
    state === 'invalid' ? "This confirmation link couldn't be verified. It may have been altered or expired. Please reply to Lee's email to confirm manually."
    : state === 'not_found' ? 'That booking is no longer on the schedule. Reply to Lee with any questions.'
    : `Thanks — we already have you locked in for ${details?.title} on ${details?.date}.`;

  return (
    <PageShell headline={headline} tone={state === 'already' ? 'success' : 'muted'}>
      <p style={{ margin: 0, color: '#374151', fontSize: 15, lineHeight: 1.55 }}>{body}</p>
      {details && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>{details.title}</div>
          <div style={cardMetaStyle}>{details.date}{details.time ? ` · ${details.time}` : ''}</div>
          {details.location && <div style={cardMetaMutedStyle}>{details.location}</div>}
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
