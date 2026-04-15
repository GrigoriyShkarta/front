'use client';

import { Stack, Divider, Group, Checkbox, TextInput, Box, Text, ActionIcon } from '@mantine/core';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import { UseFormReturnType } from '@mantine/form';
import { IoTimeOutline, IoTrashOutline } from 'react-icons/io5';
import dayjs from 'dayjs';

const DAYS = [
  { label: 'mon', value: 'mon' },
  { label: 'tue', value: 'tue' },
  { label: 'wed', value: 'wed' },
  { label: 'thu', value: 'thu' },
  { label: 'fri', value: 'fri' },
  { label: 'sat', value: 'sat' },
  { label: 'sun', value: 'sun' },
];

interface LessonItem {
  date: Date;
  time: string;
}

interface Props {
  form: UseFormReturnType<any>;
  lessons: LessonItem[];
  currentLessonsCount: number;
  isWhiteSidebarColor: boolean;
  handleCalendarChange: (dates: any) => void;
  updateLessonTime: (index: number, time: string) => void;
  removeLesson: (index: number) => void;
}

export function SubscriptionScheduleFields({
  form,
  lessons,
  currentLessonsCount,
  isWhiteSidebarColor,
  handleCalendarChange,
  updateLessonTime,
  removeLesson
}: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();

  return (
    <Stack gap="md">
      <Divider label={t('form.start_date')} labelPosition="left" />
      
      <DatePickerInput
        locale={locale}
        {...form.getInputProps('start_date')}
      />

      <Divider label={common_t('days_of_week')} labelPosition="left" mb="md" />
      
      <Checkbox.Group
        value={form.values.selected_days}
        onChange={(val) => form.setFieldValue('selected_days', val)}
      >
        <Stack gap="xs">
          {DAYS.map((day) => {
            const is_selected = form.values.selected_days.includes(day.value);
            return (
              <Group key={day.value} justify="space-between" p="xs" className="bg-white/5 rounded-md">
                <Checkbox 
                  value={day.value} 
                  label={common_t(`days.${day.label}`)} 
                  styles={{ label: { fontWeight: 500 } }}
                />
                <TextInput
                  type="time"
                  size="sm"
                  w={130}
                  leftSection={<IoTimeOutline size={14} />}
                  value={form.values.lesson_times[day.value]}
                  onChange={(e) => form.setFieldValue(`lesson_times.${day.value}`, e.target.value)}
                  disabled={!is_selected}
                  opacity={is_selected ? 1 : 0.3}
                />
              </Group>
            );
          })}
        </Stack>
      </Checkbox.Group>

      <Divider label={common_t('preview')} labelPosition="left" />
      
      <Box className="bg-white/5 p-4 rounded-md border border-white/10">
        <Group justify="center" mb="md">
          <DatePicker
            locale={locale}
            type="multiple"
            value={lessons.map(l => l.date)}
            onChange={handleCalendarChange}
            renderDay={(date: any) => {
              const dateObj = new Date(date);
              const isSelected = lessons.some(l => dayjs(l.date).isSame(dateObj, 'day'));
              return (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text 
                    size="sm" 
                    c={isSelected ? (isWhiteSidebarColor ? 'white' : 'black') : 'inherit'}
                  >
                    {dateObj.getDate()}
                  </Text>
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mantine-primary-color-filled)'
                    }} />
                  )}
                </div>
              );
            }}
          />
        </Group>

        <Stack gap={4} mb="md">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">{common_t('preview')}</Text>
          {lessons.length > 0 ? (
            lessons.map((lesson, index) => (
              <Group key={index} justify="space-between" p="xs" className="bg-white/5 rounded-sm">
                <Text size="sm">
                  {lesson.date && dayjs(lesson.date).isValid()
                    ? dayjs(lesson.date).locale(locale).format('DD MMM (dd)')
                    : t('form.not_assigned')}
                </Text>
                <Group gap="xs">
                  <TextInput
                    type="time"
                    size="xs"
                    w={100}
                    value={lesson.time}
                    onChange={(e) => updateLessonTime(index, e.target.value)}
                  />
                  <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeLesson(index)}>
                    <IoTrashOutline size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))
          ) : (
            <Box py="xl" className="border border-dashed border-white/10 rounded-sm">
              <Text size="sm" c="dimmed" ta="center">
                {t('form.lesson_date_not_assigned') || 'Дата уроку поки ще не призначена'}
              </Text>
            </Box>
          )}
        </Stack>

        <Text size="sm" fw={500} mt="md" ta="center" c={lessons.length === currentLessonsCount ? 'green' : 'orange'}>
          {lessons.length} {common_t('lessons')} {t('selected')} 
          {currentLessonsCount > 0 && ` / ${currentLessonsCount}`}
        </Text>
        {currentLessonsCount > 0 && lessons.length !== currentLessonsCount && (
          <Text size="xs" ta="center" c="dimmed">
            {lessons.length < currentLessonsCount 
              ? t('need_more_lessons', { count: currentLessonsCount - lessons.length }) 
              : t('remove_lessons', { count: lessons.length - currentLessonsCount })}
          </Text>
        )}
      </Box>
    </Stack>
  );
}
