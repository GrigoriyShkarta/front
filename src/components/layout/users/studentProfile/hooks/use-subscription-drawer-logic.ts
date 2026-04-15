'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from '@mantine/form';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useSubscriptions } from '@/components/layout/finance/subscriptions/hooks/use-subscriptions';
import { useStudentSubscriptions } from './use-student-subscriptions';
import { StudentSubscription } from '../schemas/student-subscription-schema';
import { SubscriptionPaymentStatus } from '../subscriptions/types';

interface LessonItem {
  date: Date;
  time: string;
}

interface UseSubscriptionDrawerLogicProps {
  studentId: string;
  subscription?: StudentSubscription;
  initialDate?: Date;
  opened: boolean;
  onClose: () => void;
}

export function useSubscriptionDrawerLogic({ 
  studentId, 
  subscription, 
  initialDate, 
  opened,
  onClose 
}: UseSubscriptionDrawerLogicProps) {
  const common_t = useTranslations('Common');
  const finance_t = useTranslations('Finance.subscriptions.validation');
  const { subscriptions: templates } = useSubscriptions();
  const { create_subscription, update_subscription, is_creating, is_updating } = useStudentSubscriptions(studentId);

  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string>('');
  const [is_manual_next_payment_date, set_is_manual_next_payment_date] = useState(false);

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

  // Populate form for editing
  useEffect(() => {
    if (subscription && opened) {
      set_is_manual_next_payment_date(false);
      const firstLesson = subscription.lessons?.[0];
      
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

  useEffect(() => {
    setLessons(prev => prev.map(lesson => {
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayjs(lesson.date).day()];
      return {
        ...lesson,
        time: form.values.lesson_times[dayKey] || lesson.time
      };
    }));
  }, [form.values.lesson_times]);

  useEffect(() => {
    if (lessons.length > 0 && !subscription && !is_manual_next_payment_date) {
      const lastLesson = lessons[lessons.length - 1];
      form.setFieldValue('next_payment_date', lastLesson.date);
    }
  }, [lessons, subscription, is_manual_next_payment_date]);

  const handleSubmit = async (values: typeof form.values) => {
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

    if (datesArray.length > currentData.lessons_count) {
      // Allow removing lessons, but prevent adding if limit reached
      if (datesArray.length > lessons.length) {
         return; 
      }
    }

    const newLessons = datesArray.map(date => {
      const existing = lessons.find(l => dayjs(l.date).isSame(date, 'day'));
      if (existing) return existing;
      
      const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dayjs(date).day()];
      return {
        date: new Date(date),
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

  return {
    form,
    lessons,
    templates,
    currentData,
    is_creating,
    is_updating,
    is_form_valid,
    is_manual_next_payment_date,
    set_is_manual_next_payment_date,
    handleSubmit,
    handleCalendarChange,
    updateLessonTime,
    removeLesson,
    setLessons
  };
}
