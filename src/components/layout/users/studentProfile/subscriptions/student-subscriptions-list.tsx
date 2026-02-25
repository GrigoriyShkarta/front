import { 
  Stack, Group, Title, Button, Paper, Text, Modal
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
  const studentId = (params?.id as string) || current_user?.id || '';
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const finance_t = useTranslations('Finance.subscriptions');

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<StudentSubscription | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const {
    subscriptions, is_loading, delete_subscription,
    update_subscription, update_lesson, create_subscription
  } = useStudentSubscriptions(studentId);

  useEffect(() => {
    if (subscriptions.length > 0 && expandedIds.length === 0) {
      setExpandedIds([subscriptions[0].id]);
    }
  }, [subscriptions]);

  const isTeacher = ['super_admin', 'admin', 'teacher'].includes(current_user?.role || '');

  const handleToggle = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(activeId => activeId !== id) 
        : [...prev, id]
    );
  };

  const handleEdit = (sub: StudentSubscription) => {
    setEditingSubscription(sub);
    setDrawerOpened(true);
  };

  const handleExtend = async (sub: StudentSubscription) => {
    const lessonsCount = sub.subscription?.lessons_count || sub.lessons?.length || 0;
    const selectedDays = sub.selected_days;
    
    // Start searching for new lessons 1 month after the current first lesson
    let current = dayjs(sub.lessons?.[0]?.date).add(1, 'month');
    
    const dayMap: Record<string, number> = {
      sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
    };
    const targetDaysIndices = selectedDays.map(d => dayMap[d]);

    // Extract times for each day from existing lessons
    const dayTimes: Record<number, string> = {};
    sub.lessons?.forEach(l => {
      const d = dayjs(l.date);
      dayTimes[d.day()] = d.format('HH:mm');
    });

    const newLessonDates: string[] = [];
    // Generate lessons until count is reached
    while (newLessonDates.length < lessonsCount && newLessonDates.length < 50) {
      if (targetDaysIndices.includes(current.day())) {
        const timeStr = dayTimes[current.day()] || '10:00';
        const [h, m] = timeStr.split(':').map(Number);
        newLessonDates.push(current.hour(h).minute(m).second(0).millisecond(0).toISOString());
      }
      current = current.add(1, 'day');
    }

    const data: CreateStudentSubscriptionData = {
      subscription_id: sub.subscription_id,
      student_id: studentId,
      paid_amount: 0,
      payment_status: 'unpaid',
      payment_date: sub.payment_date ? dayjs(sub.payment_date).add(1, 'month').toISOString() : undefined,
      partial_payment_date: sub.partial_payment_date ? dayjs(sub.partial_payment_date).add(1, 'month').toISOString() : undefined,
      next_payment_date: newLessonDates.at(-1),
      payment_reminder: sub.payment_reminder,
      selected_days: sub.selected_days,
      lesson_dates: newLessonDates
    };
    
    await create_subscription(data);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await delete_subscription(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={4}>{t('tabs.subscriptions')}</Title>
        {isTeacher && (
          <Button
            variant="filled"
            leftSection={<IoAddOutline size={18} />}
            onClick={() => {
              setEditingSubscription(undefined);
              setDrawerOpened(true);
            }}
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
              isTeacher={isTeacher}
              onEdit={handleEdit}
              onDelete={setDeletingId}
              onUpdateSubscription={update_subscription}
              onUpdateLesson={update_lesson}
              isExpanded={index === 0 || expandedIds.includes(sub.id)}
              canToggle={index !== 0}
              onToggle={() => handleToggle(sub.id)}
              showExtend={index === 0}
              onExtend={() => handleExtend(sub)}
            />
          ))}
        </Stack>
      )}

      <StudentSubscriptionDrawer
        opened={drawerOpened}
        onClose={() => {
          setDrawerOpened(false);
          setEditingSubscription(undefined);
        }}
        studentId={studentId}
        subscription={editingSubscription}
      />

      <Modal 
        opened={!!deletingId} 
        onClose={() => setDeletingId(null)}
        title={finance_t('delete_confirm.title')}
        centered
      >
        <Stack gap="md">
          <Text size="sm">{finance_t('delete_confirm.description')}</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeletingId(null)}>{common_t('cancel')}</Button>
            <Button color="red" onClick={handleDelete}>{common_t('delete')}</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
