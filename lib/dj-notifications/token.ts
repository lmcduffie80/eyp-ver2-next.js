import { createHmac, timingSafeEqual } from 'crypto';

// Signed one-click confirmation links.
//
// Payload we sign: `${bookingId}|${djUser}|${emailType}`
// This binds a token to a specific booking + DJ + reminder cadence so it can't be
// replayed on a different booking, and so we can record which email the DJ acted on.

function getSecret(): string {
  const secret = process.env.DJ_CONFIRM_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('DJ_CONFIRM_SECRET must be set (>= 16 chars) to sign confirm links');
  }
  return secret;
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Buffer.from(padded, 'base64');
}

export interface ConfirmPayload {
  bookingId: number;
  djUser: string;
  emailType: string;
}

export function signConfirmToken(p: ConfirmPayload): string {
  const payload = `${p.bookingId}|${p.djUser}|${p.emailType}`;
  const mac = createHmac('sha256', getSecret()).update(payload).digest();
  return `${base64UrlEncode(Buffer.from(payload, 'utf8'))}.${base64UrlEncode(mac)}`;
}

export function verifyConfirmToken(token: string): ConfirmPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadPart, macPart] = parts;

  let payloadBuf: Buffer;
  let macBuf: Buffer;
  try {
    payloadBuf = base64UrlDecode(payloadPart);
    macBuf = base64UrlDecode(macPart);
  } catch {
    return null;
  }

  const expected = createHmac('sha256', getSecret()).update(payloadBuf).digest();
  if (macBuf.length !== expected.length) return null;
  if (!timingSafeEqual(macBuf, expected)) return null;

  const payload = payloadBuf.toString('utf8');
  const segments = payload.split('|');
  if (segments.length !== 3) return null;
  const [bookingIdStr, djUser, emailType] = segments;
  const bookingId = Number(bookingIdStr);
  if (!Number.isInteger(bookingId) || bookingId <= 0) return null;
  if (!djUser || !emailType) return null;

  return { bookingId, djUser, emailType };
}
