'use client';

import { useState } from 'react';

import {
  Drawer,
  Stack,
  Group,
  Text,
  Avatar,
  Badge,
  Paper,
  Box,
  Textarea,
  NumberInput,
  Select,
  Button,
  RingProgress,
  Divider,
} from '@mantine/core';
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoHourglassOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

import { cn } from '@/lib/utils';
import { TestAttempt, TestAnswer, ATTEMPT_STATUSES } from '../../schemas/test-attempt-schema';
import { TestQuestion, QUESTION_TYPES } from '../../schemas/test-schema';

interface Props {
  opened: boolean;
  on_close: () => void;
  attempt: TestAttempt | undefined;
  questions: TestQuestion[];
  on_review: (params: {
    attempt_id: string;
    answer_id: string;
    data: { points_awarded: number; teacher_comment?: string };
  }) => void;
  is_reviewing: boolean;
  is_loading: boolean;
}

/**
 * Drawer that shows a student's full test attempt for admin review.
 * Allows grading detailed_answer questions.
 */
export function TestAttemptReviewDrawer({
  opened,
  on_close,
  attempt,
  questions,
  on_review,
  is_reviewing,
  is_loading,
}: Props) {
  const t = useTranslations('Materials.tests.results');

  if (!attempt) return null;

  const format_time = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Drawer
      opened={opened}
      onClose={on_close}
      title={t('review_drawer.title')}
      position="right"
      size="lg"
      padding="xl"
    >
      <Stack gap="xl">
        {/* Student info header */}
        <Group gap="md">
          <Avatar src={attempt.student_avatar} size={48} radius="xl">
            {attempt.student_name?.charAt(0)}
          </Avatar>
          <div>
            <Text fw={700}>{attempt.student_name}</Text>
            <Text size="xs" c="dimmed">
              {dayjs(attempt.started_at).format('DD.MM.YYYY HH:mm')}
              {' · '}
              {format_time(attempt.time_spent)}
            </Text>
          </div>
          <Box ml="auto">
            <RingProgress
              size={56}
              thickness={6}
              roundCaps
              sections={[{
                value: attempt.percentage,
                color: attempt.is_passed ? 'teal' : 'red',
              }]}
              label={
                <Text size="xs" fw={700} className="text-center tabular-nums">
                  {Math.round(attempt.percentage)}%
                </Text>
              }
            />
          </Box>
        </Group>

        <Divider />

        {/* Questions with answers */}
        <Stack gap="md">
          {questions.map((q, idx) => {
            const answer = attempt.answers.find(a => a.question_id === q.id);
            return (
              <AnswerReviewCard
                key={q.id}
                question={q}
                answer={answer}
                index={idx}
                attempt_id={attempt.id}
                on_review={on_review}
                is_reviewing={is_reviewing}
              />
            );
          })}
        </Stack>
      </Stack>
    </Drawer>
  );
}

/**
 * Individual answer card inside the review drawer
 */
function AnswerReviewCard({
  question,
  answer,
  index,
  attempt_id,
  on_review,
  is_reviewing,
}: {
  question: TestQuestion;
  answer: TestAnswer | undefined;
  index: number;
  attempt_id: string;
  on_review: Props['on_review'];
  is_reviewing: boolean;
}) {
  const t = useTranslations('Materials.tests.results');
  const [review_points, set_review_points] = useState(answer?.points_awarded || 0);
  const [review_comment, set_review_comment] = useState(answer?.teacher_comment || '');

  const is_correct = answer?.is_correct === true;
  const is_wrong = answer?.is_correct === false;
  const is_pending = answer?.is_correct === null;
  const is_detailed = question.type === QUESTION_TYPES.DETAILED_ANSWER;

  const get_student_answer_text = () => {
    if (!answer) return t('review_drawer.no_answer');

    if (answer.text_answer) return answer.text_answer;

    if (answer.selected_option_ids && question.options) {
      return question.options
        .filter(o => answer.selected_option_ids?.includes(o.id))
        .map(o => o.text)
        .join(', ') || t('review_drawer.no_answer');
    }

    return t('review_drawer.no_answer');
  };

  const get_correct_answer = () => {
    if (question.type === QUESTION_TYPES.FILL_IN_BLANK) {
      return question.correct_answer_text || '';
    }
    if (question.options) {
      return question.options.filter(o => o.is_correct).map(o => o.text).join(', ');
    }
    return '';
  };

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      className={cn(
        'border-white/10',
        is_correct && 'border-l-4 border-l-emerald-500/50',
        is_wrong && 'border-l-4 border-l-red-500/50',
        is_pending && 'border-l-4 border-l-orange-400/50'
      )}
    >
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <Text size="xs" fw={600} c="dimmed">#{index + 1}</Text>
            {is_correct && <IoCheckmarkCircleOutline size={16} className="text-emerald-400" />}
            {is_wrong && <IoCloseCircleOutline size={16} className="text-red-400" />}
            {is_pending && <IoHourglassOutline size={16} className="text-orange-400" />}
          </Group>
          <Badge variant="light" color="gray" size="xs">
            {answer?.points_awarded || 0}/{question.points}
          </Badge>
        </Group>

        {/* Question */}
        <Text size="sm" fw={600}>{question.question}</Text>

        {/* Student answer */}
        <Box className="p-3 rounded-md bg-white/5 border border-white/10">
          <Text size="xs" c="dimmed" mb={4}>{t('review_drawer.student_answer')}</Text>
          <Text size="sm">{get_student_answer_text()}</Text>
        </Box>

        {/* Correct answer (for auto-graded) */}
        {!is_detailed && (
          <Box className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/10">
            <Text size="xs" c="dimmed" mb={4}>{t('review_drawer.correct_answer')}</Text>
            <Text size="sm" c="teal">{get_correct_answer()}</Text>
          </Box>
        )}

        {/* Review controls for detailed answers */}
        {is_detailed && is_pending && (
          <Stack gap="sm" mt="xs" className="p-3 rounded-md bg-orange-500/5 border border-orange-500/10">
            <Text size="xs" fw={600} c="orange.4">
              {t('review_drawer.review_section')}
            </Text>
            <Select
              label={t('review_drawer.points_label')}
              value={review_points.toString()}
              onChange={(val) => set_review_points(Number(val))}
              data={Array.from({ length: question.points + 1 }, (_, i) => ({
                value: i.toString(),
                label: i.toString(),
              }))}
              size="sm"
              variant="filled"
              allowDeselect={false}
            />
            <Textarea
              label={t('review_drawer.comment_label')}
              placeholder={t('review_drawer.comment_placeholder')}
              value={review_comment}
              onChange={(e) => set_review_comment(e.currentTarget.value)}
              minRows={2}
              size="sm"
              variant="filled"
            />
            <Button
              size="sm"
              radius="md"
              color="primary"
              loading={is_reviewing}
              onClick={() =>
                on_review({
                  attempt_id,
                  answer_id: answer?.id || question.id,
                  data: {
                    points_awarded: review_points,
                    teacher_comment: review_comment || undefined,
                  },
                })
              }
            >
              {t('review_drawer.confirm_review')}
            </Button>
          </Stack>
        )}

        {/* Already reviewed comment */}
        {is_detailed && !is_pending && answer?.teacher_comment && (
          <Box className="p-3 rounded-md bg-primary/5 border border-primary/10">
            <Text size="xs" c="dimmed" mb={4}>{t('review_drawer.teacher_comment')}</Text>
            <Text size="sm">{answer.teacher_comment}</Text>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
