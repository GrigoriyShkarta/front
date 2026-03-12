'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { calendarActions } from '../actions/calendar-actions';
import { notifications } from '@mantine/notifications';
import { useLocale, useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { CalendarEvent, ManualEvent, is_google_event, is_personal_event } from '../schemas/event-schema';
import { useAuthContext } from '@/context/auth-context';
import { ROLES } from '@/types/auth.types';
import { useUsersQuery } from '@/components/layout/users/hooks/use-users-query';
import { studentSubscriptionActions } from '@/components/layout/users/studentProfile/actions/student-subscription-actions';
import { LessonEvent, is_lesson_event as check_is_lesson } from '../schemas/event-schema';

export type CalendarView = 'day' | 'week' | 'month';

interface UseCalendarProps {
  student_id?: string;
}

/**
 * Custom hook to manage calendar state: current date, view, events and Google Calendar integration.
 */
export function useCalendar({ student_id }: UseCalendarProps = {}) {
  const [current_date, set_current_date] = useState(new Date());
  const [current_view, set_current_view] = useState<CalendarView>('week');

  const { start_date, end_date } = useMemo(() => {
    let start, end;
    if (current_view === 'month') {
      start = dayjs(current_date).startOf('month').startOf('week');
      end = dayjs(current_date).endOf('month').endOf('week');
    } else if (current_view === 'week') {
      start = dayjs(current_date).startOf('week');
      end = dayjs(current_date).endOf('week');
    } else {
      start = dayjs(current_date).startOf('day');
      end = dayjs(current_date).endOf('day');
    }
    return {
      start_date: start.format('YYYY-MM-DD'),
      end_date: end.format('YYYY-MM-DD'),
    };
  }, [current_date, current_view]);

  const queryClient = useQueryClient();
  const locale = useLocale();
  const { user } = useAuthContext();
  const is_student = user?.role === ROLES.STUDENT;
  const t = useTranslations('Calendar');

  // ─── Google Calendar status ────────────────────────────────────────────────
  const { data: googleCalendarStatus, isLoading: isLoadingGoogleStatus } = useQuery({
    queryKey: ['google-calendar-status'],
    queryFn: () => calendarActions.get_google_calendar_status(),
  });

  // ─── Internal subscription lesson events ──────────────────────────────────
  const {
    data: internalEvents = [],
    isLoading: isLoadingInternal,
    isFetching: isFetchingInternal,
  } = useQuery({
    queryKey: queryKeys.finance.subscriptions.calendar({ start_date, end_date, student_id }),
    queryFn: () => calendarActions.get_calendar_events({ start_date, end_date, student_id }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,  // 10 minutes
  });

  // ─── Personal Google Calendar events ──────────────────────────────────────
  // Only fetched when Google Calendar is connected.
  // Backend already filters out our own lesson events — no deduplication needed.
  const {
    data: googleEvents = [],
    isLoading: isLoadingGoogleEvents,
    isFetching: isFetchingGoogleEvents,
  } = useQuery({
    queryKey: ['google-calendar-personal-events', start_date, end_date],
    queryFn: () => calendarActions.get_google_calendar_events({ start_date, end_date }),
    enabled: !!googleCalendarStatus?.isConnected,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // ─── Merge — no deduplication required (backend guarantees uniqueness) ────
  const events = useMemo<CalendarEvent[]>(
    () => [...internalEvents, ...googleEvents],
    [internalEvents, googleEvents]
  );

  const isLoading =
    isLoadingInternal ||
    (!!googleCalendarStatus?.isConnected && isLoadingGoogleEvents);

  const isFetching =
    isFetchingInternal ||
    (!!googleCalendarStatus?.isConnected && isFetchingGoogleEvents);

  // ─── Handle ?calendar_synced=true redirect param ──────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('calendar_synced') === 'true') {
      notifications.show({
        title: t('google_connected_title'),
        message: t('google_connected_message'),
        color: 'green',
      });

      // Remove the query param without a full reload
      params.delete('calendar_synced');
      const new_url =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', new_url);

      // Re-fetch the status so the UI reflects the new connection
      queryClient.invalidateQueries({ queryKey: ['google-calendar-status'] });
    }
  }, [queryClient, t]);

  // ─── Google Calendar connect / disconnect ─────────────────────────────────
  const connectGoogleCalendar = async () => {
    try {
      const { url } = await calendarActions.get_google_calendar_auth_url(locale);
      window.location.href = url;
    } catch {
      // swallow — user will see nothing happen, no sensitive info to log
    }
  };

  const disconnectGoogleCalendar = useMutation({
    mutationFn: () => calendarActions.disconnect_google_calendar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-status'] });
      notifications.show({
        title: t('google_disconnected_title'),
        message: t('google_disconnected_message'),
        color: 'gray',
      });
    },
  });

  const updateGoogleEvent = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ManualEvent }) => {
      const attendees = values.attendees?.map(aid => {
        if (aid.includes('@')) return { email: aid };
        const student = students.find(s => s.id === aid);
        return student?.email ? { email: student.email } : null;
      }).filter(Boolean) as { email: string }[];

      return calendarActions.update_google_calendar_event(id, {
        summary: values.title,
        description: values.description,
        start_time: dayjs(values.start_date).toISOString(),
        end_time: dayjs(values.end_date).toISOString(),
        attendees,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.calendar({ start_date, end_date, student_id }) });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-personal-events'] });
      notifications.show({
        title: t('success_title'),
        message: t('event_updated_success'),
        color: 'green',
      });
      set_modal_opened(false);
    },
  });

  const deleteGoogleEvent = useMutation({
    mutationFn: (id: string) => calendarActions.delete_google_calendar_event(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.calendar({ start_date, end_date, student_id }) });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-personal-events'] });
      notifications.show({
        title: t('success_title'),
        message: t('event_deleted_success'),
        color: 'gray',
      });
      set_modal_opened(false);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: any }) => 
      studentSubscriptionActions.update_lesson(lessonId, data),
    onMutate: async ({ lessonId, data }) => {
      const queryKey = queryKeys.finance.subscriptions.calendar({ start_date, end_date, student_id });
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(queryKey);

      // Optimistically update to the new value
      if (previousEvents) {
        queryClient.setQueryData<CalendarEvent[]>(queryKey, (old) => 
          old?.map((event) => {
            if (event.id === lessonId) {
              const new_start = new Date(data.date);
              const duration = new Date(event.end_date).getTime() - new Date(event.start_date).getTime();
              const new_end = new Date(new_start.getTime() + duration);
              
              return { 
                ...event, 
                start_date: new_start, 
                end_date: new_end,
                date: data.date, 
                status: data.status || 'rescheduled',
                color: 'primary'
              };
            }
            return event;
          })
        );
      }

      return { previousEvents, queryKey };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousEvents) {
        queryClient.setQueryData(context.queryKey, context.previousEvents);
      }
      notifications.show({
        title: 'Error',
        message: (err as any)?.response?.data?.message || 'Failed to update lesson',
        color: 'red',
      });
    },
    onSuccess: () => {
      notifications.show({
        title: t('success_title'),
        message: t('event_updated_success'),
        color: 'green',
      });
      set_lesson_drawer_opened(false);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after error or success to make sure we have the correct server state
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  const { users: students } = useUsersQuery({ role: 'student' });

  const createGoogleEvent = useMutation({
    mutationFn: (values: ManualEvent) => {
      const attendees = values.attendees?.map(id => {
        // If it's already an email, use it
        if (id.includes('@')) return { email: id };
        // Otherwise look up student
        const student = students.find(s => s.id === id);
        return student?.email ? { email: student.email } : null;
      }).filter(Boolean) as { email: string }[];

      return calendarActions.create_google_calendar_event({
        summary: values.title,
        description: values.description,
        start_time: dayjs(values.start_date).toISOString(),
        end_time: dayjs(values.end_date).toISOString(),
        attendees,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.calendar({ start_date, end_date, student_id }) });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-personal-events'] });
      notifications.show({
        title: t('success_title'),
        message: t('event_created_success'),
        color: 'green',
      });
      set_modal_opened(false);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create Google Calendar event',
        color: 'red',
      });
    }
  });

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [modal_opened, set_modal_opened] = useState(false);
  const [selected_event, set_selected_event] = useState<CalendarEvent | null>(null);

  // ─── Subscription Drawer state ──────────────────────────────────────────────
  const [subscription_drawer_opened, set_subscription_drawer_opened] = useState(false);
  const [subscription_student_id, set_subscription_student_id] = useState<string>('');
  
  // ─── Lesson Drawer state ──────────────────────────────────────────────────
  const [lesson_drawer_opened, set_lesson_drawer_opened] = useState(false);
  const [selected_lesson, set_selected_lesson] = useState<LessonEvent | null>(null);

  const [is_navigating, set_is_navigating] = useState(false);

  useEffect(() => {
    if (!isFetching) {
      const timer = setTimeout(() => set_is_navigating(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  // ─── Navigation helpers ───────────────────────────────────────────────────
  const handle_prev = () => {
    set_is_navigating(true);
    set_current_date((prev) => dayjs(prev).subtract(1, current_view).toDate());
  };

  const handle_next = () => {
    set_is_navigating(true);
    set_current_date((prev) => dayjs(prev).add(1, current_view).toDate());
  };

  const handle_today = () => {
    set_is_navigating(true);
    set_current_date(new Date());
  };

  const handle_navigate = (date: Date, view?: CalendarView) => {
    set_is_navigating(true);
    set_current_date(date);
    if (view) set_current_view(view);
  };

  // ─── Event interaction handlers ───────────────────────────────────────────
  const handle_date_click = (date: Date) => {
    if (is_student) return;
    set_current_date(date);
    const new_event: ManualEvent = {
      title: '',
      description: '',
      start_date: date,
      end_date: dayjs(date).add(1, 'hour').toDate(),
      color: 'primary',
      all_day: false,
      source: 'manual',
    };
    set_selected_event(new_event);
    set_modal_opened(true);
  };

  const handle_event_click = (event: CalendarEvent) => {
    if (check_is_lesson(event)) {
      set_selected_lesson(event);
      set_lesson_drawer_opened(true);
    } else {
      set_selected_event(event);
      set_modal_opened(true);
    }
  };

  const handle_modal_submit = (event: CalendarEvent) => {
    if (event.id) {
      if (is_personal_event(event) || is_google_event(event)) {
        updateGoogleEvent.mutate({ id: event.id, values: event as ManualEvent });
      }
    } else {
      if (event.source === 'personal' || event.source === 'manual' || !event.source) {
        createGoogleEvent.mutate(event as ManualEvent);
      }
    }
  };

  const handle_modal_delete = (id: string) => {
    deleteGoogleEvent.mutate(id);
  };

  const handle_event_drop = (event_id: string, new_date: Date) => {
    if (is_student) return;
    const event = events.find((e) => e.id === event_id);
    if (event && check_is_lesson(event)) {
      updateLessonMutation.mutate({
        lessonId: event.id,
        data: {
          date: new_date.toISOString(),
          status: 'rescheduled',
        },
      });
    }
  };

  return {
    current_date,
    set_current_date,
    current_view,
    set_current_view,
    events,
    isLoading,
    isFetching,
    handle_prev,
    handle_next,
    handle_today,
    handle_navigate,
    modal_opened,
    set_modal_opened,
    selected_event,
    handle_date_click,
    handle_event_click,
    handle_modal_submit,
    handle_modal_delete,
    googleCalendarStatus,
    isLoadingGoogleStatus,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    subscription_drawer_opened,
    set_subscription_drawer_opened,
    subscription_student_id,
    set_subscription_student_id,
    lesson_drawer_opened,
    set_lesson_drawer_opened,
    selected_lesson,
    update_lesson_status: updateLessonMutation.mutate,
    is_student,
    handle_event_drop,
    is_navigating,
    is_mutating: createGoogleEvent.isPending || updateGoogleEvent.isPending || deleteGoogleEvent.isPending || updateLessonMutation.isPending,
  };
}
