'use client';

import { Drawer, Stack, Button, Select, Group, Checkbox, Text, Divider, Box, TextInput, NumberInput, ActionIcon, Switch } from '@mantine/core';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useTranslations, useLocale } from 'next-intl';
import { useSubscriptions } from '@/components/layout/finance/subscriptions/hooks/use-subscriptions';
import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { IoTimeOutline, IoTrashOutline } from 'react-icons/io5';
import '@mantine/dates/styles.css';

import { SubscriptionPaymentStatus } from './types';
import { StudentSubscription } from '../schemas/student-subscription-schema';

interface Props {
  opened: boolean;
  onClose: () => void;
  studentId: string;
  subscription?: StudentSubscription; // Optional for edit mode
}

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

export function StudentSubscriptionDrawer({ opened, onClose, studentId, subscription }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  const { subscriptions: templates } = useSubscriptions();
  const { create_subscription, update_subscription, is_creating, is_updating } = useStudentSubscriptions(studentId);

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const form = useForm({
    initialValues: {
      subscription_id: '',
      selected_days: [] as string[],
      start_date: new Date(),
      lesson_times: {
        mon: '10:00', tue: '10:00', wed: '10:00', thu: '10:00', fri: '10:00', sat: '10:00', sun: '10:00'
      } as Record<string, string>,
      payment_status: 'unpaid' as 'paid' | 'unpaid' | 'partially_paid',
      paid_amount: 0,
      payment_date: new Date(),
      partial_payment_date: null as Date | null,
      next_payment_date: null as Date | null,
      payment_reminder: false,
    },
    validate: {
      subscription_id: (value) => (!value ? common_t('errors.required') : null),
      selected_days: (value) => (value.length === 0 ? common_t('errors.at_least_one_day') : null),
      paid_amount: (value, values) => (values.payment_status === 'partially_paid' && value <= 0 ? common_t('errors.required') : null),
    }
  });

  // Populate form for editing
  useEffect(() => {
    if (subscription && opened) {
      const firstLesson = subscription.lessons?.[0];
      
      // Extract times for each day of the week from lessons
      const times: Record<string, string> = {
        mon: '10:00', tue: '10:00', wed: '10:00', thu: '10:00', fri: '10:00', sat: '10:00', sun: '10:00'
      };
      
      subscription.lessons?.forEach(l => {
        const d = dayjs(l.date);
        const dayKey = d.format('ddd').toLowerCase();
        times[dayKey] = d.format('HH:mm');
      });

      form.setValues({
        subscription_id: subscription.subscription_id,
        selected_days: subscription.selected_days,
        start_date: firstLesson ? new Date(firstLesson.date) : new Date(),
        lesson_times: times,
        payment_status: subscription.payment_status as SubscriptionPaymentStatus,
        paid_amount: subscription.paid_amount,
        payment_date: subscription.payment_date ? new Date(subscription.payment_date) : new Date(),
        partial_payment_date: subscription.partial_payment_date ? new Date(subscription.partial_payment_date) : null,
        next_payment_date: subscription.next_payment_date ? new Date(subscription.next_payment_date) : null,
        payment_reminder: subscription.payment_reminder || false,
      });
      
      if (subscription.lessons) {
        setLessons(subscription.lessons.map(l => ({
          date: new Date(l.date),
          time: dayjs(l.date).format('HH:mm')
        })));
        
        // Prevent immediate auto-generation by setting lastGenerated
        const selectedTemplateId = subscription.subscription_id;
        const stateKey = `${selectedTemplateId}-${subscription.selected_days.join(',')}-${dayjs(firstLesson?.date).toISOString()}`;
        setLastGenerated(stateKey);
      }
    } else if (!opened) {
      form.reset();
      setLessons([]);
      setLastGenerated('');
    }
  }, [subscription, opened]);

  const selectedTemplate = templates.find(temp => temp.id === form.values.subscription_id);

  // Set paid_amount automatically when status is 'paid'
  useEffect(() => {
    if (form.values.payment_status === 'paid' && selectedTemplate) {
      form.setFieldValue('paid_amount', selectedTemplate.price);
    } else if (form.values.payment_status === 'unpaid') {
      form.setFieldValue('paid_amount', 0);
    }
  }, [form.values.payment_status, selectedTemplate]);

  // Auto-generate lessons when template, days or start_date changes
  useEffect(() => {
    if (selectedTemplate && form.values.selected_days.length > 0 && form.values.start_date) {
      const stateKey = `${selectedTemplate.id}-${form.values.selected_days.join(',')}-${dayjs(form.values.start_date).toISOString()}`;
      if (stateKey !== lastGenerated) {
        const generated: LessonItem[] = [];
        let current = dayjs(form.values.start_date);
        const dayMap: Record<string, number> = {
          sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
        };
        const targetDays = form.values.selected_days.map(d => dayMap[d]);

        while (generated.length < selectedTemplate.lessons_count && generated.length < 50) {
          if (targetDays.includes(current.day())) {
            const dayKey = current.format('ddd').toLowerCase();
            generated.push({
              date: current.toDate(),
              time: form.values.lesson_times[dayKey] || '10:00'
            });
          }
          current = current.add(1, 'day');
        }
        setLessons(generated);
        setLastGenerated(stateKey);
      }
    } else if (form.values.selected_days.length === 0) {
      setLessons([]);
    }
  }, [selectedTemplate, form.values.selected_days, form.values.start_date, lastGenerated, form.values.lesson_times]);

  // Sync lesson times when global times change
  useEffect(() => {
    setLessons(prev => prev.map(lesson => {
      const dayKey = dayjs(lesson.date).format('ddd').toLowerCase();
      return {
        ...lesson,
        time: form.values.lesson_times[dayKey] || lesson.time
      };
    }));
  }, [form.values.lesson_times]);

  // Update next_payment_date when lessons change
  useEffect(() => {
    if (lessons.length > 0) {
      const lastLesson = lessons[lessons.length - 1];
      form.setFieldValue('next_payment_date', lastLesson.date);
    }
  }, [lessons]);

  const handleSubmit = async (values: typeof form.values) => {
    if (lessons.length !== selectedTemplate?.lessons_count) return;

    // Combine date and time for each lesson to build lesson_dates
    const lesson_dates = lessons.map(lesson => {
      const [hours, minutes] = lesson.time.split(':').map(Number);
      return dayjs(lesson.date)
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0)
        .toISOString();
    });

    if (subscription) {
      await update_subscription({
        id: subscription.id,
        data: {
          paid_amount: values.paid_amount,
          payment_status: values.payment_status,
          payment_date: values.payment_date ? dayjs(values.payment_date).toISOString() : undefined,
          partial_payment_date: values.partial_payment_date ? dayjs(values.partial_payment_date).toISOString() : undefined,
          next_payment_date: values.next_payment_date ? dayjs(values.next_payment_date).toISOString() : undefined,
          payment_reminder: values.payment_reminder,
          selected_days: values.selected_days,
        }
      });
    } else {
      await create_subscription({
        subscription_id: values.subscription_id,
        student_id: studentId,
        paid_amount: values.paid_amount,
        payment_status: values.payment_status,
        payment_date: values.payment_date ? dayjs(values.payment_date).toISOString() : undefined,
        partial_payment_date: values.partial_payment_date ? dayjs(values.partial_payment_date).toISOString() : undefined,
        next_payment_date: values.next_payment_date ? dayjs(values.next_payment_date).toISOString() : undefined,
        payment_reminder: values.payment_reminder,
        lesson_dates,
        selected_days: values.selected_days,
      });
    }
    
    onClose();
    form.reset();
    setLessons([]);
  };

  const handleCalendarChange = (dates: any) => {
    const datesArray: Date[] = Array.isArray(dates) ? dates : dates ? [dates] : [];
    if (selectedTemplate && datesArray.length > selectedTemplate.lessons_count) return;

    const newLessons = datesArray.map(date => {
      const existing = lessons.find(l => dayjs(l.date).isSame(date, 'day'));
      if (existing) return existing;
      
      const dayKey = dayjs(date).format('ddd').toLowerCase();
      return {
        date: new Date(date), // Ensure it's a Date object
        time: form.values.lesson_times[dayKey] || '10:00'
      };
    });

    setLessons(newLessons.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()));
  };

  const updateLessonTime = (index: number, time: string) => {
    const newLessons = [...lessons];
    newLessons[index].time = time;
    setLessons(newLessons);
  };

  const removeLesson = (index: number) => {
    const newLessons = [...lessons];
    newLessons.splice(index, 1);
    setLessons(newLessons);
  };

  const is_form_valid = 
    form.values.subscription_id && 
    form.values.selected_days.length > 0 && 
    selectedTemplate &&
    lessons.length === selectedTemplate?.lessons_count;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">{t('add_subscription')}</Text>}
      position="right"
      size="md"
      className="student-subscription-drawer"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label={t('subscription')}
            placeholder={t('no_subscriptions')}
            data={templates.map(temp => ({ 
              value: temp.id, 
              label: `${temp.name} (${temp.lessons_count} ${common_t('lessons')}) - ${temp.price} ₴` 
            }))}
            {...form.getInputProps('subscription_id')}
          />

          {form.values.subscription_id && (
            <>
              <Divider label={common_t('payment_details')} labelPosition="left" />

              <Group grow align="flex-start">
                <Select
                  label={common_t('payment_status')}
                  placeholder={common_t('payment_status')}
                  data={[
                    { value: 'paid', label: common_t('payment_statuses.paid') },
                    { value: 'unpaid', label: common_t('payment_statuses.unpaid') },
                    { value: 'partially_paid', label: common_t('payment_statuses.partially_paid') },
                  ]}
                  {...form.getInputProps('payment_status')}
                />
                {form.values.payment_status === 'partially_paid' && (
                  <NumberInput
                    label={common_t('paid_amount')}
                    min={0}
                    max={selectedTemplate?.price}
                    allowDecimal={false}
                    allowNegative={false}
                    allowLeadingZeros={false}
                    variant="filled"
                    {...form.getInputProps('paid_amount')}
                  />
                )}
              </Group>

              {form.values.payment_status === 'partially_paid' && (
                <DatePickerInput
                  label={t('form.partial_payment_date') || 'Partial payment date'}
                  locale={locale}
                  clearable
                  {...form.getInputProps('partial_payment_date')}
                />
              )}

              <DatePickerInput
                label={common_t('payment_date')}
                locale={locale}
                {...form.getInputProps('payment_date')}
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

              <Group grow align="flex-start">
                <DatePickerInput
                  label={t('form.next_payment_date') || 'Next payment date'}
                  locale={locale}
                  {...form.getInputProps('next_payment_date')}
                />
                <Box pt={32}>
                  <Switch
                    label={t('form.payment_reminder') || 'Payment reminder'}
                    {...form.getInputProps('payment_reminder', { type: 'checkbox' })}
                  />
                </Box>
              </Group>

              <Divider label={t('form.start_date')} labelPosition="left" />
              
              <DatePickerInput
                locale={locale}
                {...form.getInputProps('start_date')}
              />

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
                          <Text size="sm" c={isSelected ? 'blue' : 'inherit'}>{dateObj.getDate()}</Text>
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              bottom: 4,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              backgroundColor: 'var(--mantine-color-blue-filled)'
                            }} />
                          )}
                        </div>
                      );
                    }}
                  />
                </Group>

                {lessons.length > 0 && (
                  <Stack gap={4} mb="md">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">{common_t('preview')}</Text>
                    {lessons.map((lesson, index) => (
                      <Group key={index} justify="space-between" p="xs" className="bg-white/5 rounded-sm">
                        <Text size="sm">{dayjs(lesson.date).locale(locale).format('DD MMM (ddd)')}</Text>
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
                    ))}
                  </Stack>
                )}

                <Text size="sm" fw={500} mt="md" ta="center" c={lessons.length === selectedTemplate?.lessons_count ? 'green' : 'orange'}>
                  {lessons.length} {common_t('lessons')} {t('selected')} 
                  {selectedTemplate && ` / ${selectedTemplate.lessons_count}`}
                </Text>
                {selectedTemplate && lessons.length !== selectedTemplate.lessons_count && (
                  <Text size="xs" ta="center" c="dimmed">
                    {lessons.length < selectedTemplate.lessons_count 
                      ? t('need_more_lessons', { count: selectedTemplate.lessons_count - lessons.length }) 
                      : t('remove_lessons', { count: lessons.length - selectedTemplate.lessons_count })}
                  </Text>
                )}
              </Box>

              <Group justify="flex-end" mt="xl">
                <Button 
                  type="submit" 
                  loading={is_creating} 
                  disabled={!is_form_valid}
                  fullWidth
                >
                  {common_t('save')}
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </form>
    </Drawer>
  );
}
