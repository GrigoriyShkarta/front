'use client';

import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Box,
  Button,
  RingProgress,
  ThemeIcon,
  Collapse,
} from '@mantine/core';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoHourglassOutline,
} from 'react-icons/io5';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TestAttempt, ATTEMPT_STATUSES } from '../../schemas/test-attempt-schema';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';

interface Props {
  attempt: TestAttempt;
  questions: TestQuestion[];
  on_back: () => void;
}

/**
 * Result screen shown after completing a test.
 * Shows score, pass/fail status, time, and optionally detailed answer breakdown.
 */
export function TestResultScreen({ attempt, questions, on_back }: Props) {
  const t = useTranslations('Materials.tests.results');
  const [show_details, set_show_details] = useState(false);

  const has_pending = attempt.status === ATTEMPT_STATUSES.PENDING_REVIEW;
  const is_passed = attempt.is_passed;

  const format_time = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ring_color = has_pending ? 'orange' : is_passed ? 'teal' : 'red';

  return (
    <Stack gap="xl" maw={700} mx="auto" py="xl" className="animate-in fade-in zoom-in-95 duration-500">
      {/* Status badge */}
      <Stack align="center" gap="lg">
        <RingProgress
          size={160}
          thickness={12}
          roundCaps
          sections={[{ value: attempt.percentage, color: ring_color }]}
          label={
            <Stack align="center" gap={0}>
              <Text size="2rem" fw={800} className="tabular-nums">
                {Math.round(attempt.percentage)}%
              </Text>
            </Stack>
          }
        />

        <StatusBadge status={attempt.status} is_passed={is_passed} />

        <Title order={2} fw={700} className="text-center">
          {has_pending ? t('pending_title') : is_passed ? t('passed_title') : t('failed_title')}
        </Title>
      </Stack>

      {/* Stats cards */}
      <Group justify="center" gap="md">
        <StatCard
          icon={<IoCheckmarkCircleOutline size={20} />}
          label={t('score')}
          value={`${attempt.score}/${attempt.max_score}`}
          color="primary"
        />
        <StatCard
          icon={<IoTimeOutline size={20} />}
          label={t('time_spent')}
          value={format_time(attempt.time_spent)}
          color="gray"
        />
      </Group>

      {has_pending && (
        <Paper
          withBorder
          p="md"
          radius="lg"
          className="bg-orange-500/5 border-orange-500/20 text-center"
        >
          <Group justify="center" gap="sm">
            <IoHourglassOutline size={20} className="text-orange-400" />
            <Text size="sm" c="dimmed">
              {t('pending_review_message')}
            </Text>
          </Group>
        </Paper>
      )}

      {/* Toggle details */}
      <Button
        variant="subtle"
        color="gray"
        onClick={() => set_show_details(!show_details)}
        rightSection={show_details ? <IoChevronUpOutline size={16} /> : <IoChevronDownOutline size={16} />}
        className="mx-auto"
      >
        {show_details ? t('hide_details') : t('show_details')}
      </Button>

      <Collapse in={show_details}>
        <AnswerBreakdown attempt={attempt} questions={questions} />
      </Collapse>

      <Group justify="center">
        <Button variant="light" color="gray" onClick={on_back} radius="md" size="md">
          {t('back_to_tests')}
        </Button>
      </Group>
    </Stack>
  );
}

/**
 * Pass/Fail/Pending status badge
 */
function StatusBadge({ status, is_passed }: { status: string; is_passed: boolean }) {
  const t = useTranslations('Materials.tests.results');
  const has_pending = status === ATTEMPT_STATUSES.PENDING_REVIEW;

  return (
    <Box
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-bold',
        has_pending && 'bg-orange-500/15 text-orange-400',
        !has_pending && is_passed && 'bg-emerald-500/15 text-emerald-400',
        !has_pending && !is_passed && 'bg-red-500/15 text-red-400'
      )}
    >
      {has_pending ? t('status_pending') : is_passed ? t('status_passed') : t('status_failed')}
    </Box>
  );
}

/**
 * Stat card for score / time
 */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Paper withBorder p="md" radius="lg" className="bg-white/[0.03] border-white/10 min-w-[140px]">
      <Stack align="center" gap="xs">
        <ThemeIcon variant="light" color={color} size="lg" radius="md">
          {icon}
        </ThemeIcon>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="lg" fw={700} className="tabular-nums">{value}</Text>
      </Stack>
    </Paper>
  );
}

/**
 * Detailed answer breakdown showing each Q with correct/wrong marking
 */
function AnswerBreakdown({
  attempt,
  questions,
}: {
  attempt: TestAttempt;
  questions: TestQuestion[];
}) {
  const t = useTranslations('Materials.tests.results');

  return (
    <Stack gap="sm">
      {questions.map((q, idx) => {
        const answer = attempt.answers.find(a => a.question_id === q.id);
        const is_correct = answer?.is_correct === true;
        const is_pending = answer?.is_correct === null;
        const is_wrong = answer?.is_correct === false;

        return (
          <Paper
            key={q.id}
            withBorder
            p="md"
            radius="md"
            className={cn(
              'border-white/10',
              is_correct && 'bg-emerald-500/5 border-emerald-500/20',
              is_wrong && 'bg-red-500/5 border-red-500/20',
              is_pending && 'bg-orange-500/5 border-orange-500/20'
            )}
          >
            <Group justify="space-between" align="flex-start">
              <Group gap="sm" wrap="nowrap" className="flex-1">
                <Text size="sm" fw={600} c="dimmed">#{idx + 1}</Text>
                <Text size="sm" fw={500} className="line-clamp-2">{q.question}</Text>
              </Group>
              <Box>
                {is_correct && <IoCheckmarkCircleOutline size={20} className="text-emerald-400" />}
                {is_wrong && <IoCloseCircleOutline size={20} className="text-red-400" />}
                {is_pending && <IoHourglassOutline size={20} className="text-orange-400" />}
              </Box>
            </Group>

            {/* Show correct answer for wrong answers (not for detailed) */}
            {is_wrong && q.type !== QUESTION_TYPES.DETAILED_ANSWER && (
              <Text size="xs" mt="xs" c="dimmed">
                {t('correct_answer')}: {get_correct_answer_text(q)}
              </Text>
            )}

            {is_pending && (
              <Text size="xs" mt="xs" c="orange.4" fs="italic">
                {t('awaiting_review')}
              </Text>
            )}

            {answer && (
              <Text size="xs" mt={4} c="dimmed">
                {answer.points_awarded}/{q.points} {t('points_label')}
              </Text>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}

/**
 * Helper to extract correct answer text from a question
 */
function get_correct_answer_text(question: TestQuestion): string {
  if (question.type === QUESTION_TYPES.FILL_IN_BLANK) {
    return question.correct_answer_text || '';
  }
  if (question.options) {
    return question.options
      .filter(o => o.is_correct)
      .map(o => o.text)
      .join(', ');
  }
  return '';
}
