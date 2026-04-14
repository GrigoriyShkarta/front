'use client';

import { Drawer, Stack, Button, Select, Group, Checkbox, Text, Divider, Box, TextInput, NumberInput, ActionIcon, Switch, SegmentedControl, Textarea } from '@mantine/core';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useTranslations, useLocale } from 'next-intl';
import { useSubscriptions } from '@/components/layout/finance/subscriptions/hooks/use-subscriptions';
import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import dayjs from 'dayjs';
import 'dayjs/locale/uk';
import 'dayjs/locale/en';
import { IoTimeOutline, IoTrashOutline } from 'react-icons/io5';
import '@mantine/dates/styles.css';
import { cn } from '@/lib/utils';

import { SubscriptionPaymentStatus } from './types';
import { StudentSubscription } from '../schemas/student-subscription-schema';

interface Props {
  opened: boolean;
  studentId: string;
  subscription?: StudentSubscription; // Optional for edit mode
  initialDate?: Date; // Pre-select start date when opening from calendar
  onClose: () => void;
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

export function StudentSubscriptionDrawer({ opened, onClose, studentId, subscription, initialDate }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();
  const { subscriptions: templates } = useSubscriptions();
  const finance_t = useTranslations('Finance.subscriptions.validation');
  const { create_subscription, update_subscription, is_creating, is_updating } = useStudentSubscriptions(studentId);
  const { user } = useAuth();
  const is_white_sidebar_color = user?.space?.personalization?.is_white_sidebar_color ?? false;

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string>('');

  const form = useForm({
    initialValues: {
      subscription_type: 'template' as 'template' | 'custom',
      subscription_id: '',
      name: '',
      price: 0,
      lessons_count: 1,
      comment: '',
      selected_days: [] as string[],
      start_date: new Date(),
      lesson_times: {
        mon: '10:00', tue: '10:00', wed: '10:00', thu: '10:00', fri: '10:00', sat: '10:00', sun: '10:00'
      } as Record<string, string>,
      payment_status: 'paid' as 'paid' | 'unpaid' | 'partially_paid',
      paid_amount: 0,
      payment_date: new Date() as Date | null,
      partial_payment_date: null as Date | null,
      next_payment_date: null as Date | null,
      payment_reminder: false,
    },
    validate: {
      subscription_id: (value, values) => (values.subscription_type === 'template' && !value ? common_t('errors.required') : null),
      name: (value, values) => (values.subscription_type === 'custom' && !value ? finance_t('name_required') : null),
      price: (value, values) => (values.subscription_type === 'custom' && (value === undefined || value < 0) ? finance_t('price_non_negative') : null),
      lessons_count: (value, values) => (values.subscription_type === 'custom' && (!value || value <= 0) ? finance_t('lessons_count_required') : null),
      paid_amount: (value, values) => (values.payment_status === 'partially_paid' && (value === undefined || value < 0) ? finance_t('paid_amount_required') : null),
    }
  });

  const [is_manual_next_payment_date, set_is_manual_next_payment_date] = useState(false);

  // Populate form for editing
  useEffect(() => {
    if (subscription && opened) {
      set_is_manual_next_payment_date(false);
      const firstLesson = subscription.lessons?.[0];
      
      // Extract times for each day of the week from lessons
      const times: Record<string, string> = {
        mon: '10:00', tue: '10:00', wed: '10:00', thu: '10:00', fri: '10:00', sat: '10:00', sun: '10:00'
      };
      
      subscription.lessons?.forEach(l => {
        const d = dayjs(l.date);
        const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.day()];
        times[dayKey] = d.format('HH:mm');
      });

      const type = subscription.subscription_id ? 'template' as const : 'custom' as const;

      form.setValues({
        subscription_type: type,
        subscription_id: subscription.subscription_id || '',
        name: subscription?.name ?? subscription.subscription?.name ?? '',
        price: subscription.price || 0,
        lessons_count: subscription.lessons?.length || 1,
        comment: subscription.comment || '',
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
        const selectedTemplateId = subscription.subscription_id || 'custom';
        const stateKey = `${selectedTemplateId}-${subscription.lessons?.length || 1}-${subscription.selected_days.join(',')}-${dayjs(firstLesson?.date).toISOString()}`;
        setLastGenerated(stateKey);
      }
    } else if (!opened) {
      form.reset();
      setLessons([]);
      setLastGenerated('');
      set_is_manual_next_payment_date(false);
    } else if (opened && !subscription) {
      // Opening in creation mode, possibly with an initial date from Calendar
      const startDate = initialDate || new Date();
      const times: Record<string, string> = {
        mon: '10:00', tue: '10:00', wed: '10:00', thu: '10:00', fri: '10:00', sat: '10:00', sun: '10:00'
      };
      const selectedDays: string[] = [];

      if (initialDate) {
        const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayjs(initialDate).day()];
        times[dayKey] = dayjs(initialDate).format('HH:mm');
        selectedDays.push(dayKey);
      }

      form.setValues({
        ...form.values,
        start_date: startDate,
        lesson_times: times,
        selected_days: selectedDays,
      });
    }
  }, [subscription, opened, initialDate]);

  // Reset manual flag when subscription plan changes significantly
  useEffect(() => {
    set_is_manual_next_payment_date(false);
  }, [form.values.subscription_id, form.values.subscription_type]);

  const selectedTemplate = templates.find(temp => temp.id === form.values.subscription_id);

  const currentData = useMemo(() => {
    if (form.values.subscription_type === 'template') {
      return {
        price: selectedTemplate?.price || 0,
        lessons_count: selectedTemplate?.lessons_count || 1,
        name: selectedTemplate?.name || '',
      };
    }
    return {
      price: form.values.price,
      lessons_count: form.values.lessons_count,
      name: form.values.name,
    };
  }, [form.values.subscription_type, selectedTemplate, form.values.price, form.values.lessons_count, form.values.name]);

  // Set paid_amount automatically when status is 'paid'
  useEffect(() => {
    if (form.values.payment_status === 'paid') {
      form.setFieldValue('paid_amount', currentData.price);
      if (!form.values.payment_date) {
        form.setFieldValue('payment_date', new Date());
      }
    } else if (form.values.payment_status === 'unpaid') {
      form.setFieldValue('paid_amount', 0);
      form.setFieldValue('payment_date', null);
    }
  }, [form.values.payment_status, currentData.price]);

  // Auto-generate lessons
  useEffect(() => {
    const hasConfig = form.values.subscription_type === 'template' 
      ? !!selectedTemplate 
      : (form.values.lessons_count > 0 && !!form.values.name);

    if (hasConfig && form.values.selected_days.length > 0 && form.values.start_date) {
      const configId = form.values.subscription_type === 'template' ? selectedTemplate?.id : 'custom';
      const stateKey = `${configId}-${form.values.lessons_count}-${form.values.selected_days.join(',')}-${dayjs(form.values.start_date).toISOString()}`;
      
      if (stateKey !== lastGenerated) {
        const generated: LessonItem[] = [];
        let current = dayjs(form.values.start_date);
        const dayMap: Record<string, number> = {
          sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
        };
        const targetDays = form.values.selected_days.map(d => dayMap[d]);

        let limitSafe = 0;
        while (generated.length < currentData.lessons_count && limitSafe < 100) {
          limitSafe++;
          if (targetDays.includes(current.day())) {
            const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][current.day()];
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
  }, [form.values.subscription_type, selectedTemplate, form.values.lessons_count, form.values.name, form.values.selected_days, form.values.start_date, lastGenerated, form.values.lesson_times, currentData.lessons_count]);

  // Sync lesson times when global times change
  useEffect(() => {
    setLessons(prev => prev.map(lesson => {
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayjs(lesson.date).day()];
      return {
        ...lesson,
        time: form.values.lesson_times[dayKey] || lesson.time
      };
    }));
  }, [form.values.lesson_times]);

  // Update next_payment_date when lessons change (only if not manually set)
  useEffect(() => {
    if (lessons.length > 0 && !subscription && !is_manual_next_payment_date) {
      const lastLesson = lessons[lessons.length - 1];
      form.setFieldValue('next_payment_date', lastLesson.date);
    }
  }, [lessons, subscription, is_manual_next_payment_date]);

  const handleSubmit = async (values: typeof form.values) => {
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
          payment_date: values.payment_date ? dayjs(values.payment_date).toISOString() : null,
          partial_payment_date: values.partial_payment_date ? dayjs(values.partial_payment_date).toISOString() : null,
          next_payment_date: values.next_payment_date ? dayjs(values.next_payment_date).toISOString() : null,
          payment_reminder: values.payment_reminder,
          selected_days: values.selected_days,
          lesson_dates,
          comment: values.comment,
        }
      });
    } else {
      const common_data = {
        student_id: studentId,
        paid_amount: values.paid_amount,
        payment_status: values.payment_status,
        payment_date: values.payment_date ? dayjs(values.payment_date).toISOString() : null,
        partial_payment_date: values.partial_payment_date ? dayjs(values.partial_payment_date).toISOString() : null,
        next_payment_date: values.next_payment_date ? dayjs(values.next_payment_date).toISOString() : null,
        payment_reminder: values.payment_reminder,
        lesson_dates,
        selected_days: values.selected_days,
        comment: values.comment,
      };

      if (values.subscription_type === 'template') {
        await create_subscription({
          ...common_data,
          subscription_id: values.subscription_id,
        });
      } else {
        await create_subscription({
          ...common_data,
          name: values.name,
          price: values.price,
          lessons_count: values.lessons_count,
        });
      }
    }
    
    onClose();
    form.reset();
    setLessons([]);
  };

  const handleCalendarChange = (dates: any) => {
    const datesArray: Date[] = Array.isArray(dates) ? dates : dates ? [dates] : [];

    const newLessons = datesArray.map(date => {
      const existing = lessons.find(l => dayjs(l.date).isSame(date, 'day'));
      if (existing) return existing;
      
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayjs(date).day()];
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
    (form.values.subscription_type === 'template' ? !!form.values.subscription_id : (!!form.values.name && form.values.price > 0 && form.values.lessons_count > 0));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">{subscription ? t('drawer.edit_subscription_title') || common_t('edit') : t('add_subscription')}</Text>}
      position="right"
      size="md"
      className="student-subscription-drawer"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {!subscription && (
            <SegmentedControl
              fullWidth
              color="accent"
              value={form.values.subscription_type}
              onChange={(val) => form.setFieldValue('subscription_type', val as 'template' | 'custom')}
              data={[
                { label: t('template_subscription'), value: 'template' },
                { label: t('individual_subscription'), value: 'custom' },
              ]}
            />
          )}

          {form.values.subscription_type === 'template' ? (
            <Select
              label={t('subscription')}
              placeholder={t('no_subscriptions')}
              data={templates.map(temp => ({ 
                value: temp.id, 
                label: `${temp.name} (${temp.lessons_count} ${common_t('lessons')}) - ${temp.price} ₴` 
              }))}
              {...form.getInputProps('subscription_id')}
              disabled={!!subscription}
            />
          ) : (
            <Stack gap="sm">
              <TextInput
                label={t('form.subscription_name') || 'Subscription name'}
                placeholder={t('form.subscription_name_placeholder')}
                required
                withAsterisk
                {...form.getInputProps('name')}
              />
              <Group grow>
                <NumberInput
                  label={t('form.subscription_price') || 'Price'}
                  placeholder={t('form.subscription_price_placeholder')}
                  min={0}
                  allowLeadingZeros={false}
                  required
                  withAsterisk
                  {...form.getInputProps('price')}
                />
                <NumberInput
                  label={t('form.lessons_count') || 'Lessons count'}
                  placeholder={t('form.lessons_count_placeholder')}
                  min={1}
                  allowLeadingZeros={false}
                  required
                  withAsterisk
                  {...form.getInputProps('lessons_count')}
                />
              </Group>
            </Stack>
          )}

          {(form.values.subscription_type === 'custom' || form.values.subscription_id) && (
            <>
              <Textarea
                label={t('form.comment')}
                placeholder={t('form.comment_placeholder')}
                minRows={2}
                autosize
                {...form.getInputProps('comment')}
              />

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
                    max={currentData.price}
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
                clearable
                {...form.getInputProps('payment_date')}
              />

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

              <Group grow align="center">
                <DatePickerInput
                  label={t('form.next_payment_date') || 'Next payment date'}
                  locale={locale}
                  clearable
                  {...form.getInputProps('next_payment_date')}
                  onChange={(val) => {
                    form.setFieldValue('next_payment_date', val as any);
                    set_is_manual_next_payment_date(true);
                  }}
                />
                <Box pt={22}>
                  <Switch
                    label={t('form.payment_reminder') || 'Payment reminder'}
                    {...form.getInputProps('payment_reminder', { type: 'checkbox' })}
                    styles={{
                      root: { display: 'flex', alignItems: 'center' },
                      body: { alignItems: 'center' }
                    }}
                  />
                </Box>
              </Group>

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
                            c={isSelected ? (is_white_sidebar_color ? 'white' : 'black') : 'inherit'}
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
                            ? dayjs(lesson.date).locale(locale).format('DD MMM (ddd)')
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

                <Text size="sm" fw={500} mt="md" ta="center" c={lessons.length === currentData.lessons_count ? 'green' : 'orange'}>
                  {lessons.length} {common_t('lessons')} {t('selected')} 
                  {currentData.lessons_count > 0 && ` / ${currentData.lessons_count}`}
                </Text>
                {currentData.lessons_count > 0 && lessons.length !== currentData.lessons_count && (
                  <Text size="xs" ta="center" c="dimmed">
                    {lessons.length < currentData.lessons_count 
                      ? t('need_more_lessons', { count: currentData.lessons_count - lessons.length }) 
                      : t('remove_lessons', { count: lessons.length - currentData.lessons_count })}
                  </Text>
                )}
              </Box>

              <Group justify="flex-end" mt="xl">
                <Button 
                  type="submit" 
                  loading={is_creating || is_updating} 
                  disabled={!is_form_valid || is_creating || is_updating || (subscription ? !form.isDirty() : false)}
                  fullWidth
                  color="primary"
                  className={cn(
                    "bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md shadow-primary/20",
                    "disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                  )}
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
