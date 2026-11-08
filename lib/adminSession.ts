// Shared by the admin portal client and server-side session checks.

export const ADMIN_IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// How often an active admin tab refreshes the server-side session.
export const ADMIN_HEARTBEAT_MS = 60 * 1000;

// The server allows one extra heartbeat of slack so an active user is never
// rejected just because their latest activity hasn't been reported yet.
export function getAdminIdleCutoff(): string {
  return new Date(Date.now() - ADMIN_IDLE_TIMEOUT_MS - ADMIN_HEARTBEAT_MS).toISOString();
}
