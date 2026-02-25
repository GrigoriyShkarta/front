import { 
  Paper, Stack, Group, Text, Tooltip, ActionIcon, Badge 
} from '@mantine/core';
import { useTranslations, useLocale } from 'next-intl';
import { IoPencilOutline, IoTrashOutline, IoRepeatOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { StudentSubscription } from '../schemas/student-subscription-schema';
import { SubscriptionPaymentSection } from './subscription-payment-section';
import { SubscriptionLessonItem } from './subscription-lesson-item';

import { SubscriptionLesson, StudentSubscriptionCardProps } from './types';

export function StudentSubscriptionCard({ 
  sub, isTeacher, onEdit, onDelete, onUpdateSubscription, onUpdateLesson,
  isExpanded = true, onToggle, canToggle = true, showExtend = false, onExtend
}: StudentSubscriptionCardProps) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();

  const handleExtendClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExtend) onExtend();
  };

  const startDate = sub.lessons?.[0]?.date;
  const endDate = sub.lessons?.[sub.lessons.length - 1]?.date;

  const STATUS_COLORS: Record<string, string> = {
    attended: 'rgba(64, 192, 87, 0.3)',
    scheduled: 'rgba(34, 139, 230, 0.3)',
    burned: 'rgba(250, 82, 82, 0.3)',
    rescheduled: 'rgba(250, 176, 5, 0.3)',
  };

  const periodString = (startDate || endDate) ? (
    `${startDate ? dayjs(startDate).locale(locale).format('DD.MM.YYYY') : '...'} — ${endDate ? dayjs(endDate).locale(locale).format('DD.MM.YYYY') : '...'}`
  ) : '';

  if (!isExpanded) {
    return (
      <Paper 
        withBorder 
        p="xs" 
        className="bg-white/5 border-white/10 w-full cursor-pointer hover:bg-white/10 transition-colors"
        onClick={onToggle}
      >
        <Group gap="xs" wrap="nowrap" flex={1}>
          <Text fw={700} size="sm" className="text-white truncate">
            {sub.subscription?.name || t('subscription')} ({sub.price} ₴)
          </Text>
          <Text size="xs" c="dimmed" fw={500} className="whitespace-nowrap">
            {periodString}
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" className="bg-white/5 border-white/10 w-full relative">
      <Stack gap="md">
        {/* Top Header */}
        <Group justify="space-between" align="flex-start">
          <Stack 
            gap={2} 
            onClick={canToggle ? onToggle : undefined} 
            className={canToggle ? 'cursor-pointer' : ''} 
            flex={1}
          >
            <Text fw={700} size="lg" className="text-white">{sub.subscription?.name || t('subscription')}</Text>
            <Text fw={700} size="xl" color="var(--space-primary)">
              {sub.price} ₴
            </Text>
            {periodString && (
              <Text size="xs" c="dimmed" fw={500}>
                {periodString}
              </Text>
            )}
          </Stack>
          <Group gap="xs">
            {isTeacher && (
              <Group gap={4} ml="md">
                {showExtend && (
                  <Tooltip label={t('form.extend_subscription') || 'Extend subscription'}>
                    <ActionIcon variant="subtle" style={{ color: 'var(--space-primary)' }} onClick={handleExtendClick}>
                      <IoRepeatOutline size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label={common_t('edit')}>
                  <ActionIcon variant="subtle" color="gray" onClick={(e) => { e.stopPropagation(); onEdit(sub); }}>
                    <IoPencilOutline size={18} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={common_t('delete')}>
                  <ActionIcon variant="subtle" color="red" onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }}>
                    <IoTrashOutline size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          </Group>
        </Group>

        {/* Payment Info Row */}
        <SubscriptionPaymentSection 
          sub={sub} 
          isTeacher={isTeacher} 
          onUpdate={onUpdateSubscription} 
        />

        {/* Lessons horizontal area */}
        <Group gap="xs" wrap="wrap">
          {sub.lessons?.map((lesson: SubscriptionLesson) => (
            <SubscriptionLessonItem 
              key={lesson.id}
              lesson={lesson}
              isTeacher={isTeacher}
              statusColors={STATUS_COLORS}
              onUpdate={onUpdateLesson}
            />
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}
