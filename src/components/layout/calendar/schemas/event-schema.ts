import { z } from 'zod';

// ─── Lesson event (from /finance/subscriptions/calendar) ───────────────────

export const lesson_event_schema = z.object({
  id: z.string(),
  date: z.string(),
  status: z.enum(['attended', 'scheduled', 'burned', 'rescheduled']),
  subscription: z.object({
    id: z.string(),
    name: z.string(),
    student: z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
    }),
  }),
  source: z.literal('lesson'),
  // Normalised fields used by view components
  start_date: z.date(),
  end_date: z.date(),
  title: z.string(),
  subtitle: z.string().optional(),
  color: z.string().optional(),
  lesson_duration: z.number().optional(),
});

// ─── Google personal event (from /google-calendar/personal-events) ──────────

export const google_event_schema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().nullable().optional(),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  source: z.literal('google'),
  html_link: z.string().nullable().optional(),
  color_id: z.string().nullable().optional(),
  // Normalised fields used by view components
  start_date: z.date(),
  end_date: z.date(),
  title: z.string(),
  subtitle: z.string().optional(),
  color: z.string().optional(),
});

// ─── Legacy manual event (created inside the app) ───────────────────────────

export const manual_event_schema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'required'),
  description: z.string().optional(),
  start_date: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()),
  end_date: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()),
  color: z.string().optional(),
  all_day: z.boolean().optional(),
  source: z.enum(['manual', 'personal']).optional(),
  subtitle: z.string().optional(),
  attendees: z.array(z.string()).optional(), // Store student IDs here for the UI
}).refine((data) => data.end_date > data.start_date, {
  message: 'invalid_date_range',
  path: ['end_date'],
});

// ─── Union ───────────────────────────────────────────────────────────────────

export type LessonEvent = z.infer<typeof lesson_event_schema>;
export type GoogleCalendarEvent = z.infer<typeof google_event_schema>;
export type ManualEvent = z.infer<typeof manual_event_schema>;

/**
 * Discriminated union of all calendar event types.
 * All variants share `start_date`, `end_date`, `title`, `color`, `id`.
 */
export type CalendarEvent = LessonEvent | GoogleCalendarEvent | ManualEvent;

/** Helper: is this a lesson event? */
export function is_lesson_event(e: CalendarEvent): e is LessonEvent {
  return (e as LessonEvent).source === 'lesson';
}

/** Helper: is this a Google personal event? */
export function is_google_event(e: CalendarEvent): e is GoogleCalendarEvent {
  return (e as GoogleCalendarEvent).source === 'google';
}

/** Helper: is this a personal event created in-app? */
export function is_personal_event(e: CalendarEvent): e is ManualEvent {
  return (e as ManualEvent).source === 'personal' || (e as ManualEvent).source === 'manual';
}
