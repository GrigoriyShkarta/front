import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Paper, Stack, Group, Text, Select, ActionIcon, Tooltip, Badge, Button 
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IoPencilOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

import { SubscriptionLesson, UpdateLessonData } from './types';

interface Props {
  lesson: SubscriptionLesson;
  isTeacher: boolean;
  statusColors: Record<string, string>;
  onUpdate: (data: { lessonId: string; data: UpdateLessonData }) => Promise<any>;
}

export function SubscriptionLessonItem({ lesson, isTeacher, statusColors, onUpdate }: Props) {
  const common_t = useTranslations('Common');
  const locale = useLocale();
  
  const [rescheduleData, setRescheduleData] = useState<{ status: string; date: Date } | null>(null);

  const handleStatusChange = (val: string) => {
    if (val === 'rescheduled') {
      setRescheduleData({
        status: 'rescheduled',
        date: new Date(lesson.date)
      });
    } else {
      setRescheduleData(null);
      onUpdate({ lessonId: lesson.id, data: { status: val } });
    }
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleData) return;
    await onUpdate({
      lessonId: lesson.id,
      data: {
        status: 'rescheduled',
        date: dayjs(rescheduleData.date).toISOString()
      }
    });
    setRescheduleData(null);
  };

  return (
    <Paper 
      p="xs" 
      radius="md" 
      withBorder 
      w={{ base: '100%', sm: 138 }}
      style={{ 
        backgroundColor: statusColors[lesson.status] || 'transparent',
        borderColor: 'rgba(255,255,255,0.05)'
      }}
    >
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Text size="xs" fw={700}>{dayjs(lesson.date).locale(locale).format('DD MMM')}</Text>
            <Text size="10px" c="dimmed" style={{ textTransform: 'capitalize' }}>
              {dayjs(lesson.date).locale(locale).format('dddd')}
            </Text>
          </Stack>
          <Text size="xs" fw={500} c="dimmed">{dayjs(lesson.date).format('HH:mm')}</Text>
        </Group>

        {isTeacher ? (
          <Group gap={4} wrap="nowrap" align="center">
            <Select
              size="xs"
              flex={1}
              data={[
                { value: 'scheduled', label: common_t('lesson_statuses.scheduled') },
                { value: 'attended', label: common_t('lesson_statuses.attended') },
                { value: 'burned', label: common_t('lesson_statuses.burned') },
                { value: 'rescheduled', label: common_t('lesson_statuses.rescheduled') },
              ].filter(item => {
                if (lesson.status === 'attended' && item.value === 'scheduled') return false;
                if (lesson.status === 'scheduled' && item.value === 'attended') return false;
                return true;
              })}
              value={rescheduleData?.status || lesson.status}
              onChange={(val) => handleStatusChange(val || '')}
            />
            {lesson.status === 'rescheduled' && !rescheduleData && (
              <Tooltip label={common_t('edit')}>
                <ActionIcon 
                  variant="light" 
                  size="xs" 
                  color="primary" 
                  onClick={() => handleStatusChange('rescheduled')}
                >
                  <IoPencilOutline size={12} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        ) : (
          <Badge size="xs" variant="dot" color={
            lesson.status === 'attended' ? 'green' : 
            lesson.status === 'scheduled' ? 'primary' : 
            lesson.status === 'burned' ? 'red' : 'yellow'
          }>
            {common_t(`lesson_statuses.${lesson.status}`)}
          </Badge>
        )}

        {rescheduleData && isTeacher && (
          <Stack gap={4} mt={4}>
            <DateTimePicker
              size="xs"
              locale={locale}
              placeholder="New date/time"
              value={rescheduleData.date}
              onChange={(val) => setRescheduleData(prev => prev ? { ...prev, date: val ? new Date(val) : new Date() } : null)}
            />
            <Button 
              size="compact-xs" 
              variant="filled" 
              color="primary"
              onClick={handleSaveReschedule}
            >
              {common_t('save')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
