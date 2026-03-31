'use client';

import { Paper, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IoStatsChartOutline,
  IoPeopleOutline,
  IoTrophyOutline,
  IoTimeOutline,
  IoHourglassOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';

import { TestStats } from '../../schemas/test-attempt-schema';

interface Props {
  stats: TestStats;
}

/**
 * Stats cards row shown at the top of test results tab.
 * Displays key metrics: total attempts, unique students, average score, pass rate, etc.
 */
export function TestResultsStats({ stats }: Props) {
  const t = useTranslations('Materials.tests.results');

  const format_time = (seconds: number) => {
    const total_seconds = Math.round(seconds);
    const mins = Math.floor(total_seconds / 60);
    const secs = total_seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const items = [
    {
      icon: <IoStatsChartOutline size={20} />,
      label: t('stats.total_attempts'),
      value: stats.total_attempts.toString(),
      color: 'primary',
    },
    {
      icon: <IoPeopleOutline size={20} />,
      label: t('stats.unique_students'),
      value: stats.unique_students.toString(),
      color: 'blue',
    },
    {
      icon: <IoTrendingUpOutline size={20} />,
      label: t('stats.average_score'),
      value: `${Math.round(stats.average_score)}%`,
      color: 'teal',
    },
    {
      icon: <IoTrophyOutline size={20} />,
      label: t('stats.pass_rate'),
      value: `${Math.round(stats.pass_rate)}%`,
      color: 'green',
    },
    {
      icon: <IoTimeOutline size={20} />,
      label: t('stats.average_time'),
      value: format_time(stats.average_time),
      color: 'gray',
    },
    {
      icon: <IoHourglassOutline size={20} />,
      label: t('stats.pending_reviews'),
      value: stats.pending_reviews.toString(),
      color: stats.pending_reviews > 0 ? 'orange' : 'gray',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <Paper
          key={item.label}
          withBorder
          p="md"
          radius="lg"
          className="bg-white/[0.03] border-white/10 hover:bg-white/[0.05] transition-colors"
        >
          <Stack gap={8} align="center">
            <ThemeIcon variant="light" color={item.color} size="lg" radius="md">
              {item.icon}
            </ThemeIcon>
            <Text size="xl" fw={800} className="tabular-nums">
              {item.value}
            </Text>
            <Text size="xs" c="dimmed" className="text-center">
              {item.label}
            </Text>
          </Stack>
        </Paper>
      ))}
    </div>
  );
}
