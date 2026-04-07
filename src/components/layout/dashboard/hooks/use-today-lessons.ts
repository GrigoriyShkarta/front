'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { calendarActions } from '@/components/layout/calendar/actions/calendar-actions';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/use-auth';
import { is_lesson_event } from '@/components/layout/calendar/schemas/event-schema';
import type { LessonEvent } from '@/components/layout/calendar/schemas/event-schema';

/**
 * Hook to fetch all lesson events for today, sorted by start time.
 * @returns today's lessons and loading state
 */
export function useTodayLessons() {
  const { user } = useAuth();
  const today = dayjs().format('YYYY-MM-DD');

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.finance.subscriptions.calendar({ start_date: today, end_date: today }),
    queryFn: () => calendarActions.get_calendar_events({ start_date: today, end_date: today }),
    enabled: !!user,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const today_lessons: LessonEvent[] = events
    .filter(is_lesson_event)
    .sort((a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix());

  return { today_lessons, isLoading };
}
