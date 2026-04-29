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
  Loader,
  Center,
} from '@mantine/core';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoHourglassOutline,
  IoPlayOutline,
} from 'react-icons/io5';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { testAttemptActions } from '../../actions/test-attempt-actions';

import { cn } from '@/lib/utils';
import { TestAttempt, ATTEMPT_STATUSES, TestAnswer } from '../../schemas/test-attempt-schema';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';
import { useRouter } from 'next/navigation';

interface Props {
  attempt: TestAttempt;
  questions: TestQuestion[];
  on_back: () => void;
  can_retake?: boolean;
  test_id?: string;
  course_id?: string;
  on_retake?: () => void;
}

/**
 * Result screen shown after completing a test.
 * Shows score, pass/fail status, time, and optionally detailed answer breakdown.
 */
export function TestResultScreen({ attempt, questions, on_back, can_retake, test_id, course_id, on_retake }: Props) {
  const t = useTranslations('Materials.tests.results');
  const tTake = useTranslations('Materials.tests.take');
  const router = useRouter();
  const [show_details, set_show_details] = useState(false);

  const has_pending = attempt.status === ATTEMPT_STATUSES.PENDING_REVIEW;
  const is_passed = attempt.is_passed;

  const handle_retake = () => {
    if (on_retake) {
      on_retake();
    } else if (test_id) {
      router.push(`/main/materials/tests/${test_id}/take${course_id ? `?courseId=${course_id}` : ''}`);
    }
  };

  const format_time = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
    
  // Fetch the full attempt to ensure we have the correct answers (sometimes completion response is light)
  const { data: full_attempt, isLoading: is_loading_full } = useQuery({
    queryKey: ['test-attempt-details', attempt.id],
    queryFn: () => testAttemptActions.get_attempt(attempt.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const display_attempt = full_attempt || attempt;

  // Use questions from the attempt if available (enriched with correct answers by backend)
  const enriched_questions: TestQuestion[] = useMemo(() => {
    const content = display_attempt.test?.content || questions;
    if (content) {
      try {
        return typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        console.error('Failed to parse test content', e);
      }
    }
    return questions;
  }, [display_attempt.test?.content, questions]);

  const ring_color = has_pending ? 'orange' : is_passed ? 'teal' : 'red';

  // Safety fallbacks for score calculation
  const max_score = attempt.max_score ?? (attempt as any).total_points ?? questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const score = attempt.score ?? 0;
  const raw_percentage = attempt.percentage ?? (max_score > 0 ? (score / max_score) * 100 : 0);
  const display_percentage = Math.round(raw_percentage);

  return (
    <Stack gap="sm" maw={700} mx="auto" py="xl" className="animate-in fade-in zoom-in-95 duration-500">
      {/* Status badge */}
      <Stack align="center" gap="lg">
        <RingProgress
          size={160}
          thickness={12}
          roundCaps
          sections={[{ value: raw_percentage, color: ring_color }]}
          label={
            <Stack align="center" gap={0}>
              <Text size="2rem" fw={800} className="tabular-nums">
                {display_percentage}%
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
          value={`${score}/${max_score}`}
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
        {is_loading_full && !full_attempt ? (
            <Center py="xl">
                <Stack align="center" gap="xs">
                    <Loader size="sm" />
                    <Text size="xs" c="dimmed">Завантаження деталей...</Text>
                </Stack>
            </Center>
        ) : (
            <AnswerBreakdown attempt={display_attempt} questions={enriched_questions} />
        )}
      </Collapse>

      {can_retake && (test_id || on_retake) && (
        <Group justify="center" mt="xl">
          <Button
            onClick={handle_retake}
            size="lg"
            radius="xl"
            leftSection={<IoPlayOutline size={22} />}
            className="bg-primary hover:opacity-90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            {tTake('retake_button')}
          </Button>
        </Group>
      )}
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

            {/* Show student result */}
            <Stack gap={4} mt="sm">
              <Text size="xs">
                <Text span fw={600} mr={4}>{t('your_answer')}:</Text>
                <Text span c={is_correct ? 'emerald.4' : 'red.4'}>
                  {get_student_answer_text(q, answer) || '—'}
                </Text>
              </Text>

              {/* Show teacher comment if available */}
              {answer?.teacher_comment && (
                <Box mt={4} className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <Text size="xs" fw={600} mb={2} c="dimmed">{t('teacher_comment')}:</Text>
                  <Text size="xs">{answer.teacher_comment}</Text>
                </Box>
              )}

              {/* Show correct answer for wrong answers (not for detailed) */}
              {(is_wrong || is_correct) && q.type !== QUESTION_TYPES.DETAILED_ANSWER && (
                <Text size="xs">
                  <Text span fw={600} mr={4}>{t('correct_answer')}:</Text>
                  <Text span c="emerald.4">
                    {get_correct_answer_text(q) || '—'}
                  </Text>
                </Text>
              )}
            </Stack>

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
 * Helper to extract student's answer text from an answer
 */
function get_student_answer_text(q: TestQuestion, answer?: TestAnswer): string {
  if (!answer) return '';
  if (q.type === QUESTION_TYPES.FILL_IN_BLANK || q.type === QUESTION_TYPES.DETAILED_ANSWER) {
    return answer.text_answer || '';
  }
  if (q.options && answer.selected_option_ids) {
    return q.options
      .filter(o => answer.selected_option_ids?.includes(o.id))
      .map(o => o.text)
      .join(', ');
  }
  return '';
}

/**
 * Helper to extract correct answer text from a question
 */
function get_correct_answer_text(question: TestQuestion): string {
  if (question.type === QUESTION_TYPES.FILL_IN_BLANK) {
    return question.correct_answer_text || '';
  }
  if (question.options) {
    const correct = question.options.filter((o: any) => 
        o.is_correct === true || 
        o.is_correct === 'true' || 
        o.isCorrect === true || 
        o.correct === true
    );
    if (correct.length > 0) {
      return correct.map(o => o.text).join(', ');
    }
  }
  return '';
}
