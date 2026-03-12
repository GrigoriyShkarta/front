import { api } from '@/lib/api';
import { CalendarEvent, LessonEvent, GoogleCalendarEvent, ManualEvent } from '../schemas/event-schema';

interface CalendarParams {
  start_date?: string;
  end_date?: string;
  student_id?: string;
}

/** Maps lesson status to a Tailwind colour name used by get_event_style. */
function status_to_color(status: LessonEvent['status']): string {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'attended':
      return 'green';
    case 'burned':
      return 'red';
    case 'rescheduled':
      return 'yellow';
    default:
      return 'primary';
  }
}

export const calendarActions = {
  /**
   * Get subscription lesson events from the backend.
   * Endpoint: GET /finance/subscriptions/calendar
   * @param params - date range and optional student filter
   */
  get_calendar_events: async (params?: CalendarParams): Promise<CalendarEvent[]> => {
    const response = await api.get('/finance/subscriptions/calendar', { params });
    return (response.data as any[]).map((raw): CalendarEvent => {
      // Handle in-app personal events
      if (raw.source === 'personal') {
        const personal = raw.subscription?.personal_data;
        const start = new Date(raw.date || personal?.start_time);
        const end = new Date(raw.end_time || personal?.end_time || start.getTime() + 60 * 60 * 1000);
        
        return ({
          id: raw.id,
          title: personal?.summary || 'Personal Event',
          description: personal?.description || '',
          start_date: start,
          end_date: end,
          source: 'personal',
          color: 'primary',
          attendees: personal?.attendees?.map((a: any) => a.email) || [],
        } as unknown) as ManualEvent;
      }

      // Handle regular lessons
      const start = new Date(raw.date);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

      return {
        id: raw.id,
        date: raw.date,
        status: raw.status,
        subscription: {
          id: raw.subscription?.id ?? '',
          name: raw.subscription?.name ?? '',
          student: {
            id: raw.subscription?.student?.id ?? '',
            name: raw.subscription?.student?.name ?? '',
            avatar: raw.subscription?.student?.avatar ?? null,
          },
        },
        source: 'lesson',
        start_date: start,
        end_date: end,
        title: raw.subscription?.student?.name ?? 'Student',
        subtitle: raw.subscription?.name ?? undefined,
        color: status_to_color(raw.status),
      };
    });
  },

  /**
   * Get personal Google Calendar events (birthdays, meetings, etc.).
   * Backend already filters out our own lesson events.
   * Returns [] if Google Calendar is not connected.
   * Endpoint: GET /google-calendar/personal-events
   * @param params - date range
   */
  get_google_calendar_events: async (params?: CalendarParams): Promise<CalendarEvent[]> => {
    try {
      const response = await api.get('/google-calendar/personal-events', { params });
      return (response.data as any[]).map((raw): GoogleCalendarEvent => {
        const start = raw.start ? new Date(raw.start) : new Date();
        const end = raw.end
          ? new Date(raw.end)
          : new Date(start.getTime() + 60 * 60 * 1000);

        return {
          id: raw.id,
          summary: raw.summary ?? 'Google Event',
          description: raw.description ?? null,
          start: raw.start ?? null,
          end: raw.end ?? null,
          source: 'google',
          html_link: raw.html_link ?? null,
          color_id: raw.color_id ?? null,
          start_date: start,
          end_date: end,
          title: raw.summary ?? 'Google Event',
          subtitle: undefined,
          color: 'primary',
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Get Google Calendar connection status.
   * @returns { isConnected: boolean }
   */
  get_google_calendar_status: async (): Promise<{ isConnected: boolean }> => {
    const response = await api.get('/google-calendar/status');
    return response.data;
  },

  /**
   * Get the OAuth redirect URL for connecting Google Calendar.
   * @param locale - current UI locale for building the callback redirect
   */
  get_google_calendar_auth_url: async (locale: string): Promise<{ url: string }> => {
    const response = await api.get('/google-calendar/auth-url', { params: { locale } });
    return response.data;
  },

  /**
   * Disconnect Google Calendar from the user's account.
   */
  disconnect_google_calendar: async (): Promise<void> => {
    await api.delete('/google-calendar/disconnect');
  },

  /**
   * Create a new Google Calendar event.
   * Endpoint: POST /google-calendar/events
   */
  create_google_calendar_event: async (data: {
    summary: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: { email: string }[];
  }): Promise<void> => {
    await api.post('/google-calendar/events', data);
  },

  /**
   * Update an existing Google Calendar event.
   * Endpoint: PATCH /google-calendar/events/:id
   */
  update_google_calendar_event: async (id: string, data: {
    summary?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    attendees?: { email: string }[];
  }): Promise<void> => {
    await api.patch(`/google-calendar/events/${id}`, data);
  },

  /**
   * Delete a Google Calendar event.
   * Endpoint: DELETE /google-calendar/events/:id
   */
  delete_google_calendar_event: async (id: string): Promise<void> => {
    await api.delete(`/google-calendar/events/${id}`);
  },
};
