'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Group, Text, Button, Paper, Transition, ActionIcon } from '@mantine/core';
import { IoVideocamOutline, IoCloseOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { useUpcomingLesson } from '@/hooks/use-upcoming-lesson';
import { useAuth } from '@/hooks/use-auth';
import { Link, usePathname } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { useActiveCall } from '@/context/active-call-context';
import { cn } from '@/lib/utils';
import { is_lesson_event } from '../layout/calendar/schemas/event-schema';

/**
 * A sticky notification banner that appears 5 minutes before a lesson starts.
 * Features a modern, premium design with a gradient and glassmorphism.
 */
export function LessonReminder() {
  const t = useTranslations('Calendar.reminder');
  const pathname = usePathname();
  const { user } = useAuth();
  const { lesson } = useUpcomingLesson();
  const { activeCall } = useActiveCall();
  const [visible, set_visible] = useState(false);
  const [closed_id, set_closed_id] = useState<string | null>(null);
  const [clicked_id, set_clicked_id] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson) {
      set_visible(false);
      return;
    }

    const is_on_lesson_page = pathname?.includes(`/main/lesson/${lesson.id}`);
    const is_already_in_call = activeCall?.id === lesson.id;
    const is_manually_closed = lesson.id === closed_id;

    if (!is_on_lesson_page && !is_already_in_call && !is_manually_closed) {
      set_visible(true);
    } else {
      set_visible(false);
    }
  }, [lesson, closed_id, pathname, activeCall?.id]);

  if (!lesson || !is_lesson_event(lesson)) return null;

  const now = dayjs();
  const start_time = dayjs(lesson.start_date);
  const is_ongoing = now.isAfter(start_time);
  
  const student_name = lesson.subscription?.student?.name;
  const teacher_name = user?.teacher?.name;

  const person_display = user?.role === 'student' 
    ? t('with_teacher', { name: teacher_name || 'Teacher' })
    : t('with_student', { name: student_name || 'Student' });

  return (
    <Transition mounted={visible} transition="slide-down" duration={400} timingFunction="ease">
      {(styles) => (
        <Box 
          style={styles}
          className="fixed top-0 left-0 right-0 z-[100] px-4 pt-2 md:left-[240px] pointer-events-none"
        >
          <Paper 
            withBorder
            radius="lg" 
            p="md"
            className="pointer-events-auto max-w-4xl mx-auto shadow-2xl relative overflow-hidden group"
            style={{ 
              backgroundColor: 'var(--space-primary)',
              backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)',
              backdropFilter: 'blur(10px)',
              color: 'var(--space-primary-text)'
            }}
          >
            {/* Using a separate div for border to handle opacity without affecting text */}
            <Box 
               className="absolute inset-0 border pointer-events-none opacity-20"
               style={{ borderColor: 'var(--space-primary-text)' }}
            />

            {/* Animated background decoration */}
            <Box 
              className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/2"
              style={{ 
                background: 'radial-gradient(circle, var(--space-primary-text) 0%, transparent 70%)',
                filter: 'blur(40px)'
              }}
            />

            <Group justify="space-between" wrap="nowrap" gap="xl" pos="relative">
              <Group gap="md" wrap="nowrap">
                <Box 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                  style={{ backgroundColor: 'rgba(var(--space-primary-text-rgb), 0.15)' }}
                >
                  <IoVideocamOutline size={26} className="animate-pulse" />
                </Box>
                
                <Box>
                  <Text fw={700} size="lg" className="tracking-tight leading-tight">
                    {is_ongoing ? t('lesson_ongoing') : t('lesson_starts_soon')}
                  </Text>
                  <Text size="sm" className="opacity-80 font-medium">
                    {person_display} • {start_time.format('HH:mm')}
                  </Text>
                </Box>
              </Group>

              <Group gap="xs">
                {clicked_id !== lesson.id && (
                  <Button 
                    component={Link}
                    href={`/main/lesson/${lesson.id}`}
                    onClick={() => set_clicked_id(lesson.id)}
                    size="md"
                    radius="md"
                    variant="white"
                    style={{ 
                      backgroundColor: 'var(--space-primary-text)', 
                      color: 'var(--space-primary)' 
                    }}
                    className="shadow-lg px-6 font-bold transition-all hover:scale-105 active:scale-95"
                    rightSection={<IoArrowForwardOutline size={18} />}
                  >
                    {t('join_button')}
                  </Button>
                )}
                
                <ActionIcon 
                  variant="subtle" 
                  size="lg" 
                  radius="md"
                  onClick={() => {
                    set_visible(false);
                    set_closed_id(lesson.id);
                  }}
                  style={{ color: 'var(--space-primary-text)' }}
                  className="hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <IoCloseOutline size={24} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        </Box>
      )}
    </Transition>
  );
}
