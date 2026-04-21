'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { api } from '@/lib/api';

/**
 * Hook to manage the lesson end timer.
 * Fetches lesson data and calculates remaining time.
 * 
 * @param lesson_id ID of the lesson (call ID)
 * @returns remaining_seconds, is_ending_soon flag
 */
export function useLessonTimer(lesson_id: string | undefined) {
  const [end_time, set_end_time] = useState<string | null>(null);
  const [remaining_seconds, set_remaining_seconds] = useState<number | null>(null);

  useEffect(() => {
    if (!lesson_id) return;

    const fetch_lesson = async () => {
      try {
        const res = await api.get(`/finance/subscriptions/lesson/${lesson_id}`);
        // Endpoint returns lesson with optional subscription relation
        const lesson = res.data;
        const start_date = dayjs(lesson.date);
        
        // Use duration from lesson itself, or from its parent subscription, or default to 50m
        const duration = lesson.lesson_duration || 
                        lesson.subscription?.lesson_duration || 
                        50;

        const lesson_end = lesson.end_date || 
                          (lesson.date ? start_date.add(duration, 'minute').toISOString() : 
                          dayjs().add(5, 'minute').toISOString());
        
        set_end_time(lesson_end);
      } catch (err) {
        console.error('[useLessonTimer] Failed to fetch lesson data:', err);
      }
    };

    fetch_lesson();
  }, [lesson_id]);

  useEffect(() => {
    if (!end_time) return;

    // Initial calculation
    const update_timer = () => {
      const now = dayjs();
      const end = dayjs(end_time);
      
      if (!end.isValid()) {
        set_remaining_seconds(null);
        return;
      }

      const diff = end.diff(now, 'second');
      set_remaining_seconds(diff > 0 ? diff : 0);
    };

    update_timer();
    const interval = setInterval(update_timer, 1000);

    return () => clearInterval(interval);
  }, [end_time]);

  return { 
    remaining_seconds, 
    is_ending_soon: remaining_seconds !== null && remaining_seconds <= 300 && remaining_seconds > 0,
    is_ended: remaining_seconds !== null && remaining_seconds <= 0
  };
}
