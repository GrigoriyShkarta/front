'use client';

import { 
  Stack, 
  Title, 
  Group, 
  Breadcrumbs, 
  Anchor, 
  Text, 
  Grid,
  LoadingOverlay,
  Box
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { IoCalendarOutline, IoDocumentOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

import { ReportStats } from './components/report-stats';
import { ReportTables } from './components/report-tables';
import { SubscriptionBreakdown } from './components/subscription-breakdown';
import { useReports } from './hooks/use-reports';
import { useLocale } from 'next-intl';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';

export default function ReportsLayout() {
  const locale = useLocale();
  const t = useTranslations('Finance.reports');
  const tNav = useTranslations('Navigation');

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    dayjs().startOf('month').toDate(),
    dayjs().endOf('month').toDate()
  ]);

  const { stats, is_loading } = useReports(dateRange);

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: t('title'), href: '/main/finance/reports' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={50} />

      <Breadcrumbs mb="xs" separator="→">
        {breadcrumb_items}
      </Breadcrumbs>

      <Group justify="space-between" align="flex-end">
        <Group align="center" gap="md">
          <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
            <IoDocumentOutline size={28} />
          </Box>
          <Stack gap={0}>
            <Title order={2}>{t('title')}</Title>
            <Text color="dimmed" size="sm">
              {t('subtitle')}
            </Text>
          </Stack>
        </Group>
        

        <DatePickerInput
          type="range"
          placeholder={t('select_period')}
          value={dateRange}
          onChange={(val: any) => setDateRange(val)}
          leftSection={<IoCalendarOutline size={18} />}
          size="sm"
          w={300}
          valueFormat="DD.MM.YYYY"
          clearable
          locale={locale}
        />
      </Group>

      <ReportStats stats={stats} />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
            <ReportTables 
                realIncome={stats?.realIncomeList || []} 
                expectedIncome={stats?.expectedIncomeList || []}
            />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
            <SubscriptionBreakdown 
                data={stats?.breakdown || []}
                totalRevenue={stats?.totalRevenue || 0}
            />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
