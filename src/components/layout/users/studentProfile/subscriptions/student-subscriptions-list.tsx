import { 
  Stack, Group, Button, Paper, Text, Modal
} from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoAddOutline } from 'react-icons/io5';
import { useStudentSubscriptions } from '../hooks/use-student-subscriptions';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { StudentSubscriptionDrawer } from './student-subscription-drawer';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { StudentSubscription, CreateStudentSubscriptionData } from '../schemas/student-subscription-schema';
import { StudentSubscriptionCard } from './student-subscription-card';

export function StudentSubscriptionsList() {
  const params = useParams();
  const { user: current_user } = useAuth();
  const student_id = (params?.id as string) || current_user?.id || '';
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const finance_t = useTranslations('Finance.subscriptions');

  const [drawer_opened, set_drawer_opened] = useState(false);
  const [editing_subscription, set_editing_subscription] = useState<StudentSubscription | undefined>();
  const [deleting_id, set_deleting_id] = useState<string | null>(null);
  const [expanded_ids, set_expanded_ids] = useState<string[]>([]);

  const {
    subscriptions, is_loading, delete_subscription,
    update_subscription, update_lesson, create_subscription
  } = useStudentSubscriptions(student_id);

  useEffect(() => {
    if (subscriptions.length > 0 && expanded_ids.length === 0) {
      set_expanded_ids([subscriptions[0].id]);
    }
  }, [subscriptions]);

  const is_teacher = ['super_admin', 'admin', 'teacher'].includes(current_user?.role || '');

  const handle_toggle = (id: string) => {
    set_expanded_ids(prev => 
      prev.includes(id) 
        ? prev.filter(activeId => activeId !== id) 
        : [...prev, id]
    );
  };

  const handle_edit = (sub: StudentSubscription) => {
    set_editing_subscription(sub);
    set_drawer_opened(true);
  };

  const handle_extend = async (sub: StudentSubscription) => {
    const lessons_count = sub.subscription?.lessons_count || sub.lessons?.length || 0;
    const selected_days = sub.selected_days;
    
    // Start searching for new lessons 1 month after the current first lesson
    let current = dayjs(sub.lessons?.[0]?.date).add(1, 'month');
    
    const day_map: Record<string, number> = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };
    const target_days_indices = selected_days.map(d => day_map[d]);

    // Extract times for each day from existing lessons
    const day_times: Record<number, string> = {};
    sub.lessons?.forEach(l => {
      const d = dayjs(l.date);
      day_times[d.day()] = d.format('HH:mm');
    });

    const new_lesson_dates: string[] = [];
    // Generate lessons until count is reached
    while (new_lesson_dates.length < lessons_count && new_lesson_dates.length < 50) {
      if (target_days_indices.includes(current.day())) {
        const time_str = day_times[current.day()] || '10:00';
        const [h, m] = time_str.split(':').map(Number);
        new_lesson_dates.push(current.hour(h).minute(m).second(0).millisecond(0).toISOString());
      }
      current = current.add(1, 'day');
    }

    const data: CreateStudentSubscriptionData = {
      subscription_id: sub.subscription_id ?? undefined,
      student_id: student_id,
      paid_amount: 0,
      payment_status: 'unpaid',
      payment_date: sub.payment_date ? dayjs(sub.payment_date).add(1, 'month').toISOString() : undefined,
      partial_payment_date: sub.partial_payment_date ? dayjs(sub.partial_payment_date).add(1, 'month').toISOString() : undefined,
      next_payment_date: new_lesson_dates.at(-1),
      payment_reminder: sub.payment_reminder,
      selected_days: sub.selected_days,
      lesson_dates: new_lesson_dates
    };
    
    await create_subscription(data);
  };

  const handle_delete = async () => {
    if (deleting_id) {
      await delete_subscription(deleting_id);
      set_deleting_id(null);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="flex-end">
        {is_teacher && (
          <Button
            variant="filled"
            leftSection={<IoAddOutline size={18} />}
            onClick={() => {
              set_editing_subscription(undefined);
              set_drawer_opened(true);
            }}
            color="primary"
            className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            {t('add_subscription') || 'Add Subscription'}
          </Button>
        )}
      </Group>

      {subscriptions.length === 0 && !is_loading ? (
        <Paper withBorder p="xl" className="bg-white/5 border-white/10">
          <Stack align="center" py="xl">
            <Text c="dimmed">{t('no_subscriptions_yet')}</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="xs">
          {subscriptions.map((sub, index) => (
            <StudentSubscriptionCard
              key={sub.id}
              sub={sub}
              isTeacher={is_teacher}
              onEdit={handle_edit}
              onDelete={set_deleting_id}
              onUpdateSubscription={update_subscription}
              onUpdateLesson={update_lesson}
              isExpanded={index === 0 || expanded_ids.includes(sub.id)}
              canToggle={index !== 0}
              onToggle={() => handle_toggle(sub.id)}
              showExtend={index === 0}
              onExtend={() => handle_extend(sub)}
            />
          ))}
        </Stack>
      )}

      <StudentSubscriptionDrawer
        opened={drawer_opened}
        onClose={() => {
          set_drawer_opened(false);
          set_editing_subscription(undefined);
        }}
        studentId={student_id}
        subscription={editing_subscription}
      />

      <Modal 
        opened={!!deleting_id} 
        onClose={() => set_deleting_id(null)}
        title={finance_t('delete_confirm.title')}
        centered
      >
        <Stack gap="md">
          <Text size="sm">{finance_t('delete_confirm.description')}</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => set_deleting_id(null)}>{common_t('cancel')}</Button>
            <Button color="red" onClick={handle_delete}>{common_t('delete')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
