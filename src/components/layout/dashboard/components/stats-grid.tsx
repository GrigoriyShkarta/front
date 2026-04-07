'use client';

import { Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { useTranslations } from 'next-intl';
import {
  IoPeopleOutline,
  IoWalletOutline,
  IoCalendarOutline,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';

interface Props {
  primary_color?: string;
}

export function StatsGrid({ primary_color }: Props) {
  const t = useTranslations('Dashboard.stats');
  const { user } = useAuth();
  const router = useRouter();

  const is_admin =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.TEACHER;

  // Render stats for Admin
  if (is_admin) {
    const tests_pending = user?.tests_to_review_count ?? 0;
    const hw_pending = user?.homeworks_to_review_count ?? 0;
    const total_pending = tests_pending + hw_pending;

    const stats = [
      {
        title: t('active_students'),
        value: '12', // Placeholder (until real endpoint exists)
        icon: IoPeopleOutline,
        color: 'blue',
      },
      {
        title: t('lessons_taught'),
        value: '64', // Placeholder
        icon: IoCalendarOutline,
        color: 'teal',
      },
      {
        title: t('revenue'),
        value: '24,500 ₴', // Placeholder
        icon: IoWalletOutline,
        color: 'grape',
      },
    ];

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {stats.map((stat) => (
          <Paper
            key={stat.title}
            p="md"
            radius="xl"
            className={cn(
              "border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm",
              "transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            )}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  {stat.title}
                </Text>
                <Text fw={800} size="xl" className="mt-1">
                  {stat.value}
                </Text>
              </Stack>
              <ThemeIcon
                size="lg"
                radius="md"
                variant="light"
                color={primary_color ? 'primary' : stat.color}
                style={primary_color ? { color: primary_color, backgroundColor: `${primary_color}1a` } : undefined}
              >
                <stat.icon size={18} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}

        {/* Action Required Widget (Pending reviews) */}
        <Paper
          p="md"
          radius="xl"
          onClick={() => {
            if (tests_pending > 0) router.push('/main/materials/tests/reviews');
            else if (hw_pending > 0) router.push('/main/materials/homeworks/reviews');
          }}
          className={cn(
            "border-white/5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer",
            total_pending > 0
              ? "bg-red-500/10 border-red-500/20 dark:bg-red-900/20"
              : "bg-white/40 dark:bg-black/40 border-black/5 dark:border-white/10"
          )}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text size="xs" c={total_pending > 0 ? "red.7" : "dimmed"} tt="uppercase" fw={700}>
                {t('pending_reviews')}
              </Text>
              <Text fw={800} size="xl" c={total_pending > 0 ? "red.7" : undefined} className="mt-1">
                {total_pending}
              </Text>
              {total_pending > 0 && (
                <Text size="xs" c="red.6" className="mt-1 font-medium">
                  {hw_pending} {t('homeworks')} • {tests_pending} {t('tests')}
                </Text>
              )}
            </Stack>
            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={total_pending > 0 ? 'red' : 'gray'}
              className="group-hover:scale-110 transition-transform"
            >
              <IoAlertCircleOutline size={18} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>
    );
  }

  // Render stats for Student
  const student_stats = [
    {
      title: t('student_lessons_left'),
      value: '4', // Placeholder
      icon: IoCalendarOutline,
      color: 'blue',
    },
    {
      title: t('student_completed'),
      value: '12', // Placeholder
      icon: IoCheckmarkDoneOutline,
      color: 'green',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {student_stats.map((stat) => (
        <Paper
          key={stat.title}
          p="md"
          radius="xl"
          className={cn(
            "border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-sm",
            "transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          )}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                {stat.title}
              </Text>
              <Text fw={800} size="xl" className="mt-1">
                {stat.value}
              </Text>
            </Stack>
            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={primary_color ? 'primary' : stat.color}
              style={primary_color ? { color: primary_color, backgroundColor: `${primary_color}1a` } : undefined}
            >
              <stat.icon size={18} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
