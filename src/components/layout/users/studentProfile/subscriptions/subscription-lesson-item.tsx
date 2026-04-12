import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Paper, Stack, Group, Text, Select, ActionIcon, Tooltip, Badge, Button 
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
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
  const user_t = useTranslations('Users');
  const locale = useLocale();
  
  const [rescheduleData, setRescheduleData] = useState<{ status: string; date: Date } | null>(null);

  const handleStatusChange = (val: string, is_manual_edit = false) => {
    if (val === 'rescheduled' || is_manual_edit) {
      setRescheduleData({
        status: is_manual_edit ? lesson.status : 'rescheduled',
        date: lesson.date && dayjs(lesson.date).isValid() ? new Date(lesson.date) : new Date()
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
        status: rescheduleData.status,
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
            <Text size="xs" fw={700}>
              {lesson.date && dayjs(lesson.date).isValid() 
                ? dayjs(lesson.date).locale(locale).format('DD MMM') 
                : user_t('form.not_assigned')}
            </Text>
            <Text size="10px" c="dimmed" style={{ textTransform: 'capitalize' }}>
              {lesson.date && dayjs(lesson.date).isValid() 
                ? dayjs(lesson.date).locale(locale).format('dddd') 
                : ''}
            </Text>
          </Stack>
          <Text size="xs" fw={500} c="dimmed">
            {lesson.date && dayjs(lesson.date).isValid() 
              ? dayjs(lesson.date).format('HH:mm') 
              : ''}
          </Text>
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
            {(lesson.status === 'rescheduled' || !lesson.date || !dayjs(lesson.date).isValid()) && !rescheduleData && (
              <Tooltip label={common_t('edit')}>
                <ActionIcon 
                  variant="light" 
                  size="xs" 
                  color="primary" 
                  onClick={() => handleStatusChange(lesson.status, true)}
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
            <Stack gap="xs">
              <DateInput
                size="xs"
                locale={locale}
                placeholder="DD.MM.YYYY"
                valueFormat="DD.MM.YYYY"
                value={rescheduleData.date}
                onChange={(val) => {
                  if (!val || !rescheduleData) return;
                  const newDate = new Date(rescheduleData.date);
                  const parsed = new Date(val);
                  newDate.setFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
                  setRescheduleData({ ...rescheduleData, date: newDate });
                }}
              />
              <TimeInput
                size="xs"
                placeholder="HH:mm"
                value={dayjs(rescheduleData.date).format('HH:mm')}
                onChange={(e) => {
                  if (!rescheduleData) return;
                  const [hours, minutes] = e.currentTarget.value.split(':').map(Number);
                  if (isNaN(hours) || isNaN(minutes)) return;
                  const newDate = new Date(rescheduleData.date);
                  newDate.setHours(hours, minutes);
                  setRescheduleData({ ...rescheduleData, date: newDate });
                }}
              />
            </Stack>
            <Button 
              size="compact-xs" 
              variant="filled" 
              color="primary"
              onClick={handleSaveReschedule}
              disabled={!rescheduleData.date || !dayjs(rescheduleData.date).isValid()}
            >
              {common_t('save')}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
