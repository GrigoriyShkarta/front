'use client';

import { SimpleGrid, Paper, Group, Text, ThemeIcon, Stack } from '@mantine/core';
import { IoCashOutline, IoCalendarOutline, IoPeopleOutline, IoTicketOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { getCurrencySymbol } from '@/lib/constants';

interface ReportStatsProps {
  stats: {
    totalRevenue: number;
    expectedRevenue: number;
    activeStudentsCount: number;
    soldSubscriptionsCount: number;
  } | null;
}

export function ReportStats({ stats }: ReportStatsProps) {
  const t = useTranslations('Finance.reports');
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.space?.personalization?.currency);

  const data = [
    {
      title: t('total_revenue'),
      value: stats ? `${stats.totalRevenue.toFixed(2)} ${currencySymbol}` : `0.00 ${currencySymbol}`,
      icon: IoCashOutline,
      color: 'green',
    },
    {
      title: t('expected_revenue'),
      value: stats ? `${stats.expectedRevenue.toFixed(2)} ${currencySymbol}` : `0.00 ${currencySymbol}`,
      icon: IoCalendarOutline,
      color: 'blue',
    },
    {
      title: t('active_students'),
      value: stats ? stats.activeStudentsCount.toString() : '0',
      icon: IoPeopleOutline,
      color: 'violet',
    },
    {
      title: t('sold_subscriptions'),
      value: stats ? stats.soldSubscriptionsCount.toString() : '0',
      icon: IoTicketOutline,
      color: 'orange',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {data.map((stat) => (
        <Paper 
          key={stat.title} 
          withBorder 
          p="md" 
          radius="md" 
          className="bg-white/5 border-white/10 hover:border-white/20 transition-all"
        >
          <Group justify="space-between">
            <Stack gap={0}>
              <Text size="xs" color="dimmed" fw={700} tt="uppercase">
                {stat.title}
              </Text>
              <Text fw={700} size="xl">
                {stat.value}
              </Text>
            </Stack>
            <ThemeIcon 
              color={stat.color} 
              variant="light" 
              size={48} 
              radius="md"
            >
              <stat.icon size={24} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
