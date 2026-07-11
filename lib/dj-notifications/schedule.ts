// Timezone-aware helpers for the DJ reminder cadence.
//
// Event dates are stored as DATE (no time) in Eastern time semantically —
// projects are physical events booked in Georgia. We compute "days until event"
// in America/New_York so a cron running at 09:00 UTC still gets the correct
// local day boundary.

const TIMEZONE = 'America/New_York';

// Format a Date as YYYY-MM-DD in a specific timezone.
function ymdInTz(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  return `${year}-${month}-${day}`;
}

function utcDateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// Whole days between two YYYY-MM-DD strings, treated as calendar days in Eastern time.
export function daysUntilEvent(eventDate: string | Date, now: Date = new Date()): number {
  const eventYmd = typeof eventDate === 'string'
    ? eventDate.slice(0, 10)
    : ymdInTz(eventDate, TIMEZONE);
  const nowYmd = ymdInTz(now, TIMEZONE);
  const eventUtc = utcDateFromYmd(eventYmd);
  const nowUtc = utcDateFromYmd(nowYmd);
  return Math.round((eventUtc.getTime() - nowUtc.getTime()) / 86_400_000);
}

// Reminder cadence: milestone emails at exactly 14/7/3/1 days out. On every
// other day inside the 14-day confirmation window (including the event day
// itself), the DJ gets a plain daily nag email instead — but only until they
// confirm. The moment `dj_confirmations` has a row for the booking, the cron
// stops sending anything for it (see app/api/cron/dj-reminders/route.ts).
export type MilestoneReminderType = 'reminder_14d' | 'reminder_7d' | 'reminder_3d' | 'reminder_1d';
export type ReminderType = MilestoneReminderType | `reminder_daily_${string}`;

export function isMilestoneReminder(type: ReminderType): type is MilestoneReminderType {
  return (
    type === 'reminder_14d' ||
    type === 'reminder_7d' ||
    type === 'reminder_3d' ||
    type === 'reminder_1d'
  );
}

// `now` is only used to stamp the daily reminder type with today's date, so
// each day's nag email gets its own row in dj_email_sends (and therefore
// actually goes out instead of being deduped against yesterday's send).
export function reminderTypeForDaysOut(days: number, now: Date = new Date()): ReminderType | null {
  if (days < 0 || days > 14) return null;
  if (days === 14) return 'reminder_14d';
  if (days === 7) return 'reminder_7d';
  if (days === 3) return 'reminder_3d';
  if (days === 1) return 'reminder_1d';
  return `reminder_daily_${ymdInTz(now, TIMEZONE)}`;
}

export function reminderLabel(type: ReminderType): string {
  switch (type) {
    case 'reminder_14d': return 'Two weeks out';
    case 'reminder_7d':  return 'One week out';
    case 'reminder_3d':  return 'This week';
    case 'reminder_1d':  return 'Tomorrow';
    default:             return 'Reminder';
  }
}

// Biweekly parity: even ISO weeks fire; odd ISO weeks skip. Combined with a
// weekly cron on Sunday 22:00 UTC, this gives "every other Sunday".
export function isDigestWeek(now: Date = new Date()): boolean {
  return isoWeekNumber(now) % 2 === 0;
}

function isoWeekNumber(d: Date): number {
  // Copy so we don't mutate the caller's Date, and shift to Thursday of the
  // ISO week (ISO 8601 defines the week by which Thursday it contains).
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
}

// Human-readable event date like "Saturday, May 16, 2026" in Eastern time.
export function formatEventDate(eventDate: string | Date): string {
  const ymd = typeof eventDate === 'string'
    ? eventDate.slice(0, 10)
    : ymdInTz(eventDate, TIMEZONE);
  const utc = utcDateFromYmd(ymd);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(utc);
}
