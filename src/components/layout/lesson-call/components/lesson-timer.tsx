'use client';

import { Box, Group, Text, Progress, Transition } from '@mantine/core';
import { IoTimeOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useLessonTimer } from '../hooks/use-lesson-timer';

interface Props {
  lesson_id: string;
}

/**
 * Component that displays a warning banner and a countdown timer 
 * when the lesson is about to end (last 5 minutes).
 */
export function LessonTimer({ lesson_id }: Props) {
  const t = useTranslations('Calendar.lesson_room');
  const { remaining_seconds, is_ending_soon, is_ended } = useLessonTimer(lesson_id);

  // Banner is visible only in the last 5 minutes and hidden once the lesson ends
  const is_visible = !is_ended && is_ending_soon;

  if (!is_visible || remaining_seconds === null) return null;

  const minutes = Math.floor(remaining_seconds / 60);
  const seconds = remaining_seconds % 60;
  const time_str = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Transition 
      mounted={is_visible} 
      transition="slide-down" 
      duration={400} 
      timingFunction="ease"
    >
      {(styles) => (
        <Box 
          style={{
            ...styles,
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            pointerEvents: 'none',
            width: '100%',
            maxWidth: '520px',
            padding: '0 16px'
          }}
        >
          <Box 
            className="bg-red-500/95 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-2xl overflow-hidden pointer-events-auto"
          >
            <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
              <Group gap="xs" wrap="nowrap">
                <Box className="bg-white/20 p-1.5 rounded-lg text-white">
                  <IoTimeOutline size={18} className="animate-pulse" />
                </Box>
                  <Box>
                    <Text fw={700} c="white" size="sm" className="tracking-tight opacity-95 leading-none">
                      {t('lesson_ends_soon', { timer: time_str })}
                    </Text>
                  </Box>
              </Group>
            </Group>
            
            {/* Countdown progress bar */}
            <Progress 
              value={(remaining_seconds / 300) * 100} 
              color="white" 
              size="2px" 
              radius="xl"
              className="mt-2 bg-white/10"
              styles={{
                section: { transition: 'width 1s linear' }
              }}
            />
          </Box>
        </Box>
      )}
    </Transition>
  );
}
