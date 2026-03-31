'use client';

import { Group, Text, Box, Progress, Paper, Button } from '@mantine/core';
import { IoTimeOutline, IoCheckmarkOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface Props {
  test_name: string;
  time_left: number | null;
  answered_count: number;
  total_questions: number;
  on_submit: () => void;
  is_submitting: boolean;
}

/**
 * Sticky header during test-taking.
 * Shows test name, timer, progress bar, and submit button.
 */
export function TestTakeHeader({
  test_name,
  time_left,
  answered_count,
  total_questions,
  on_submit,
  is_submitting,
}: Props) {
  const t = useTranslations('Materials.tests.take');
  const progress = total_questions > 0 ? (answered_count / total_questions) * 100 : 0;

  const format_time = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const is_warning = time_left !== null && time_left < 60;
  const is_danger = time_left !== null && time_left < 30;

  return (
    <Paper
      className={cn(
        'sticky top-0 z-50 backdrop-blur-xl border-b border-white/10',
        'bg-[var(--space-card-bg)]/95 shadow-lg'
      )}
      px="lg"
      py="sm"
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text fw={600} size="sm" className="truncate max-w-[200px] sm:max-w-xs">
          {test_name}
        </Text>

        <Group gap="md" wrap="nowrap">
          {/* Progress indicator */}
          <Group gap="xs" className="hidden sm:flex">
            <Text size="xs" c="dimmed">
              {answered_count}/{total_questions}
            </Text>
            <Progress
              value={progress}
              size="sm"
              className="w-24"
              color="primary"
              radius="xl"
            />
          </Group>

          {/* Timer */}
          {time_left !== null && (
            <Paper
              withBorder
              px="sm"
              py={4}
              radius="md"
              className={cn(
                'transition-all',
                is_danger
                  ? 'bg-red-500/20 border-red-500/30 animate-pulse'
                  : is_warning
                    ? 'bg-orange-500/10 border-orange-500/20'
                    : 'bg-white/5 border-white/10'
              )}
            >
              <Group gap={6} wrap="nowrap">
                <IoTimeOutline
                  size={16}
                  className={cn(
                    is_danger ? 'text-red-400' : is_warning ? 'text-orange-400' : 'text-zinc-400'
                  )}
                />
                <Text
                  size="sm"
                  fw={700}
                  className={cn(
                    'tabular-nums',
                    is_danger ? 'text-red-400' : is_warning ? 'text-orange-400' : ''
                  )}
                >
                  {format_time(time_left)}
                </Text>
              </Group>
            </Paper>
          )}

          {/* Submit */}
          <Button
            size="sm"
            radius="md"
            leftSection={<IoCheckmarkOutline size={16} />}
            onClick={on_submit}
            loading={is_submitting}
            className="bg-primary hover:opacity-90 shadow-md shadow-primary/20"
          >
            {t('submit')}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
