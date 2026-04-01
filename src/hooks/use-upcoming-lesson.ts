'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { calendarActions } from '@/components/layout/calendar/actions/calendar-actions';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from './use-auth';
import { is_lesson_event } from '@/components/layout/calendar/schemas/event-schema';

/**
 * Hook to find the next upcoming or current lesson for the user or a specific student.
 * Refetches every minute to keep the "5 minutes before" logic accurate.
 */
export function useUpcomingLesson(student_id?: string) {
  const { user } = useAuth();
  
  const today = dayjs().format('YYYY-MM-DD');

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.finance.subscriptions.calendar({ start_date: today, end_date: today, student_id }),
    queryFn: () => calendarActions.get_calendar_events({ start_date: today, end_date: today, student_id }),
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
    staleTime: 30000,
  });

  const now = dayjs();
  
  // Find the closest upcoming lesson or currently active lesson
  const upcoming_lesson = events
    .filter(is_lesson_event)
    .filter(event => {
      const start = dayjs(event.start_date);
      const end = dayjs(event.end_date);
      
      // Starting in less than 5 minutes OR already started but not finished
      const is_starting_soon = start.diff(now, 'minute') <= 5 && start.diff(now, 'minute') >= -5;
      const is_ongoing = now.isAfter(start) && now.isBefore(end);
      
      return is_starting_soon || is_ongoing;
    })
    .sort((a, b) => dayjs(a.start_date).unix() - dayjs(b.start_date).unix())[0];

  return {
    lesson: upcoming_lesson,
    isLoading
  };
}
