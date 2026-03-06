'use client';

import { Paper, Title, Stack, Group, Text, Progress, ScrollArea, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { getCurrencySymbol } from '@/lib/constants';

interface BreakdownItem {
  name: string;
  count: number;
  revenue: number;
}

interface SubscriptionBreakdownProps {
  data: BreakdownItem[];
  totalRevenue: number;
}

export function SubscriptionBreakdown({ data, totalRevenue }: SubscriptionBreakdownProps) {
  const t = useTranslations('Finance.reports');
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.space?.personalization?.currency);
  const totalCount = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <Paper withBorder p="md" radius="md" className="bg-white/5 border-white/10 h-fit">
      <Title order={4} mb="md">{t('breakdown_title')}</Title>
      
      <Stack gap="lg">
        {data.map((item) => {
          const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
          
          return (
            <Box key={item.name}>
              <Group justify="space-between" mb={5}>
                <Stack gap={0}>
                  <Text size="sm" fw={500}>{item.name}</Text>
                  <Text size="xs" c="dimmed">{item.count} {t('sold_count')}</Text>
                </Stack>
                <Text size="sm" fw={700}>{item.revenue.toFixed(2)} {currencySymbol}</Text>
              </Group>
              
              <Group gap="xs" align="center">
                  <Progress 
                      value={percentage} 
                      size="sm" 
                      radius="xl" 
                      className="flex-1"
                      color={user?.space?.personalization?.primary_color || 'blue'}
                  />
                  <Text size="xs" w={35} ta="right" fw={500}>
                      {percentage.toFixed(0)}%
                  </Text>
              </Group>
            </Box>
          );
        })}
        
        {data.length === 0 && (
           <Text ta="center" py="xl" c="dimmed">
              {t('no_breakdown_data')}
           </Text>
        )}
      </Stack>
    </Paper>
  );
}
