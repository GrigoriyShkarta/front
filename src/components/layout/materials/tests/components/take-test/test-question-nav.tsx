'use client';

import { Stack, Text, UnstyledButton, Box, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TestQuestion } from '../../schemas/test-schema';

interface Props {
  questions: TestQuestion[];
  current_index: number;
  on_go_to: (index: number) => void;
  get_status: (question_id: string) => 'unanswered' | 'answered' | 'skipped';
}

/**
 * Mini-map sidebar showing all questions with color-coded status.
 * Allows jumping to any question.
 */
export function TestQuestionNav({ questions, current_index, on_go_to, get_status }: Props) {
  const t = useTranslations('Materials.tests.take');

  return (
    <Stack gap="xs" className="sticky top-20">
      <Text size="xs" fw={600} c="dimmed" mb={4}>
        {t('question_nav')}
      </Text>

      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, index) => {
          const status = get_status(q.id);
          const is_current = index === current_index;

          return (
            <UnstyledButton
              key={q.id}
              onClick={() => on_go_to(index)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold',
                'transition-all duration-200 hover:scale-110',
                is_current && 'ring-2 ring-primary ring-offset-2 ring-offset-[var(--space-card-bg)]',
                status === 'answered' && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                status === 'skipped' && 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
                status === 'unanswered' && 'bg-white/5 text-zinc-500 border border-white/10'
              )}
            >
              {index + 1}
            </UnstyledButton>
          );
        })}
      </div>

      {/* Legend */}
      <Stack gap={4} mt="sm">
        <Group gap={6}>
          <Box className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
          <Text size="xs" c="dimmed">{t('status_answered')}</Text>
        </Group>
        <Group gap={6}>
          <Box className="w-3 h-3 rounded-sm bg-amber-500/15 border border-amber-500/20" />
          <Text size="xs" c="dimmed">{t('status_skipped')}</Text>
        </Group>
        <Group gap={6}>
          <Box className="w-3 h-3 rounded-sm bg-white/5 border border-white/10" />
          <Text size="xs" c="dimmed">{t('status_unanswered')}</Text>
        </Group>
      </Stack>
    </Stack>
  );
}
