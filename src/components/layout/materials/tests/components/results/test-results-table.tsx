'use client';

import { Table, Avatar, Group, Text, Badge, ActionIcon, Box, Progress } from '@mantine/core';
import { IoEyeOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

import { cn } from '@/lib/utils';
import { TestAttempt, ATTEMPT_STATUSES } from '../../schemas/test-attempt-schema';

interface Props {
  attempts: Omit<TestAttempt, 'answers'>[];
  on_view: (attempt_id: string) => void;
  show_test_name?: boolean;
}

/**
 * Columns: student, test_name (optional), date, score, time, status, actions.
 */
export function TestResultsTable({ attempts, on_view, show_test_name }: Props) {
  const t = useTranslations('Materials.tests.results.table');
  const common_t = useTranslations('Materials.tests.results');

  const format_time = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const get_status_badge = (status: string, is_passed: boolean) => {
    switch (status) {
      case ATTEMPT_STATUSES.COMPLETED:
        return (
          <Badge
            color={is_passed ? 'teal' : 'red'}
            variant="light"
            size="sm"
          >
            {is_passed ? t('status_passed') : t('status_failed')}
          </Badge>
        );
      case ATTEMPT_STATUSES.PENDING_REVIEW:
        return (
          <Badge color="orange" variant="light" size="sm">
            {t('status_pending')}
          </Badge>
        );
      case ATTEMPT_STATUSES.REVIEWED:
        return (
          <Badge
            color={is_passed ? 'teal' : 'red'}
            variant="light"
            size="sm"
          >
            {is_passed ? t('status_passed') : t('status_failed')}
          </Badge>
        );
      case ATTEMPT_STATUSES.IN_PROGRESS:
        return (
          <Badge color="blue" variant="light" size="sm">
            {t('status_in_progress')}
          </Badge>
        );
      case ATTEMPT_STATUSES.TIMED_OUT:
        return (
          <Badge color="gray" variant="light" size="sm">
            {t('status_timed_out')}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Table.ScrollContainer minWidth={700}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead className="bg-white/5 border-b border-white/10">
          <Table.Tr>
            <Table.Th>{t('student')}</Table.Th>
            {show_test_name && <Table.Th>{t('test_name')}</Table.Th>}
            <Table.Th>{t('date')}</Table.Th>
            <Table.Th>{t('score')}</Table.Th>
            <Table.Th>{t('time')}</Table.Th>
            <Table.Th>{t('status')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {attempts.map((attempt) => (
            <Table.Tr
              key={attempt.id}
              className="transition-colors border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
              onClick={() => on_view(attempt.id)}
            >
              <Table.Td>
                <Group gap="sm" wrap="nowrap">
                  <Avatar src={attempt.student_avatar} size={32} radius="xl">
                    {attempt.student_name?.charAt(0)}
                  </Avatar>
                  <Text size="sm" fw={500} className="truncate max-w-[200px]">
                    {attempt.student_name}
                  </Text>
                </Group>
              </Table.Td>
              {show_test_name && (
                <Table.Td>
                  <Text size="sm" fw={600} className="truncate max-w-[200px]">
                    {attempt.test_name || attempt.test?.name || '—'}
                  </Text>
                </Table.Td>
              )}
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {dayjs(attempt.started_at).format('DD.MM.YYYY HH:mm')}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={600} className="tabular-nums">
                    {attempt.score}/{attempt.max_score}
                  </Text>
                  <Text size="xs" c="dimmed">
                    ({Math.round(attempt.percentage)}%)
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" className="tabular-nums">
                  {format_time(attempt.time_spent)}
                </Text>
              </Table.Td>
              <Table.Td>
                {get_status_badge(attempt.status, attempt.is_passed)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
