'use client';

import { Group, UnstyledButton, Text, Stack, ThemeIcon } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { 
  IoPersonAddOutline, 
  IoLibraryOutline, 
  IoCalendarOutline, 
  IoPieChartOutline 
} from 'react-icons/io5';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/auth.types';
import { cn } from '@/lib/utils';

interface Props {
  primary_color?: string;
  secondary_color?: string;
}

export function QuickActions({ primary_color, secondary_color }: Props) {
  const t = useTranslations('Dashboard.actions');
  const { user } = useAuth();
  const router = useRouter();

  const is_admin =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.TEACHER;

  if (!is_admin) return null;

  const actions = [
    {
      id: 'add_student',
      title: t('add_student.title'),
      desc: t('add_student.desc'),
      icon: IoPersonAddOutline,
      route: '/main/users',
    },
    {
      id: 'create_course',
      title: t('create_course.title'),
      desc: t('create_course.desc'),
      icon: IoLibraryOutline,
      route: '/main/materials/courses',
    },
    {
      id: 'schedule',
      title: t('schedule.title'),
      desc: t('schedule.desc'),
      icon: IoCalendarOutline,
      route: '/main/calendar',
    },
    {
      id: 'analytics',
      title: t('analytics.title'),
      desc: t('analytics.desc'),
      icon: IoPieChartOutline,
      route: '/main/finance/reports',
    }
  ];

  return (
    <Group gap="md" pl={{ base: 0, sm: 2 }} mt={8}>
      {actions.map((action) => (
        <UnstyledButton
          key={action.id}
          onClick={() => router.push(action.route)}
          className={cn(
            "flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300",
            "bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 hover:shadow-md hover:-translate-y-0.5",
            "flex-1 sm:flex-initial min-w-[200px]"
          )}
        >
          <ThemeIcon 
            variant="light" 
            size="md" 
            radius="md" 
            color="secondary"
            className="shrink-0"
          >
            <action.icon size={16} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={600} className="leading-tight">
              {action.title}
            </Text>
            <Text size="xs" c="dimmed" className="leading-tight mt-0.5">
              {action.desc}
            </Text>
          </Stack>
        </UnstyledButton>
      ))}
    </Group>
  );
}
