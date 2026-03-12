'use client';

import { Group, Title, Button, ActionIcon, SegmentedControl, useMantineTheme } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { CalendarView } from '../hooks/use-calendar';

interface Props {
  current_date: Date;
  current_view: CalendarView;
  on_view_change: (view: CalendarView) => void;
  on_prev: () => void;
  on_next: () => void;
  on_today: () => void;
}

/**
 * Header component for the calendar with navigation and view switching.
 */
export function CalendarHeader({
  current_date,
  current_view,
  on_view_change,
  on_prev,
  on_next,
  on_today,
}: Props) {
  const t = useTranslations('Calendar');
  const theme = useMantineTheme();

  const formatted_date = dayjs(current_date).format(
    current_view === 'month' ? 'MMMM YYYY' : 'MMMM D, YYYY'
  );

  return (
    <Group justify="space-between" mb="lg">
      <Group gap="sm">
        <Title order={3} className="min-w-[200px]">
          {formatted_date}
        </Title>
        <Group gap={4}>
          <Button 
            variant="light" 
            size="compact-sm" 
            onClick={on_today}
            className="hover:bg-primary/10"
          >
            {t('today')}
          </Button>
          <ActionIcon 
            variant="subtle" 
            onClick={on_prev}
            className="hover:bg-primary/5"
          >
            <IoChevronBackOutline size={18} />
          </ActionIcon>
          <ActionIcon 
            variant="subtle" 
            onClick={on_next}
            className="hover:bg-primary/5"
          >
            <IoChevronForwardOutline size={18} />
          </ActionIcon>
        </Group>
      </Group>

      <SegmentedControl
        value={current_view}
        onChange={(value) => on_view_change(value as CalendarView)}
        data={[
          { label: t('views.month'), value: 'month' },
          { label: t('views.week'), value: 'week' },
          { label: t('views.day'), value: 'day' },
        ]}
        size="sm"
        radius="xl"
        classNames={{
          root: 'bg-white/5 border border-white/10 p-1',
          indicator: 'bg-primary shadow-sm',
          label: 'px-4'
        }}
      />
    </Group>
  );
}
