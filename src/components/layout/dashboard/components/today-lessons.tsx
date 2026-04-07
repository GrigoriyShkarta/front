'use client';

import {
  Avatar,
  Badge,
  Box,
  Group,
  Loader,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoCalendarOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useTodayLessons } from '../hooks/use-today-lessons';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import type { LessonEvent } from '@/components/layout/calendar/schemas/event-schema';

interface Props {
  primary_color?: string;
}

function LessonStatusBadge({ status }: { status: LessonEvent['status'] }) {
  const tc = useTranslations('Common');
  const color_map: Record<string, string> = {
    scheduled: 'blue',
    attended: 'green',
    burned: 'red',
    rescheduled: 'yellow',
  };
  return (
    <Badge
      size="xs"
      color={color_map[status] ?? 'gray'}
      variant="light"
      radius="sm"
    >
      {tc(`lesson_statuses.${status}`)}
    </Badge>
  );
}

function LessonRow({ lesson, primary_color, is_admin }: { lesson: LessonEvent; primary_color?: string; is_admin: boolean }) {
  const start = dayjs(lesson.start_date);
  const now = dayjs();
  const is_ongoing = now.isAfter(lesson.start_date) && now.isBefore(lesson.end_date);
  const is_past = now.isAfter(lesson.end_date);

  return (
    <Box
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
        is_ongoing
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-transparent hover:bg-black/3 dark:hover:bg-white/3',
        is_past ? 'opacity-50' : ''
      )}
    >
      {/* Time indicator */}
      <Box
        className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 min-w-[52px]"
        style={{
          background: is_ongoing
            ? 'rgba(34,197,94,0.15)'
            : primary_color
              ? `${primary_color}18`
              : 'rgba(59,130,246,0.1)',
        }}
      >
        <Text
          size="xs"
          fw={800}
          style={{ color: is_ongoing ? '#22c55e' : (primary_color ?? '#3b82f6') }}
          className="leading-none"
        >
          {start.format('HH:mm')}
        </Text>
        {is_ongoing && (
          <Box
            className="mt-1 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#22c55e' }}
          />
        )}
      </Box>

      {/* Info */}
      <Stack gap={2} className="flex-1 min-w-0">
        <Group gap={6} wrap="nowrap" align="center">
          <Text
            size="sm"
            fw={600}
            className="truncate"
          >
            {lesson.subscription.name}
          </Text>
          <LessonStatusBadge status={lesson.status} />
        </Group>

        {is_admin && (
          <Group gap={4} align="center">
            <IoPersonOutline size={12} className="shrink-0 text-dimmed" />
            <Text size="xs" c="dimmed" className="truncate">
              {lesson.subscription.student.name}
            </Text>
          </Group>
        )}
      </Stack>

      {/* Avatar */}
      {is_admin && lesson.subscription.student.avatar && (
        <Avatar
          src={lesson.subscription.student.avatar}
          size="sm"
          radius="xl"
          className="shrink-0"
        />
      )}
    </Box>
  );
}

/**
 * Today's lessons list widget.
 */
export function TodayLessons({ primary_color }: Props) {
  const t = useTranslations('Dashboard');
  const { user } = useAuth();
  const { today_lessons, isLoading } = useTodayLessons();

  const is_admin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.TEACHER;

  return (
    <Paper p="lg" radius="xl" className="border border-black/5 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
      <Stack gap="md">
        {/* Header */}
        <Group gap={8} align="center" justify="space-between">
          <Group gap={8} align="center">
            <IoCalendarOutline
              size={18}
              style={{ color: primary_color ?? 'var(--mantine-color-blue-5)' }}
            />
            <Title order={6} className="tracking-wide uppercase opacity-70">
              {t('today_lessons_title')}
            </Title>
          </Group>
          {!isLoading && (
            <Badge variant="light" size="sm" radius="xl" color={primary_color ? undefined : 'blue'}>
              {today_lessons.length}
            </Badge>
          )}
        </Group>

        {/* Content */}
        {isLoading ? (
          <Stack gap="xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={56} radius="xl" />
            ))}
          </Stack>
        ) : today_lessons.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-8 text-center">
            <IoCalendarOutline size={36} className="opacity-20 mb-2" />
            <Text size="sm" c="dimmed">
              {t('today_lessons_empty')}
            </Text>
          </Box>
        ) : (
          <Stack gap={4}>
            {today_lessons.map(lesson => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                primary_color={primary_color}
                is_admin={is_admin}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
