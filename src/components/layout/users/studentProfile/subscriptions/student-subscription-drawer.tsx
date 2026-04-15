'use client';

import { Drawer, Stack, Button, Text, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { StudentSubscription } from '../schemas/student-subscription-schema';
import { useSubscriptionDrawerLogic } from '../hooks/use-subscription-drawer-logic';

import { SubscriptionTypeSection } from './components/subscription-type-section';
import { SubscriptionPaymentFields } from './components/subscription-payment-fields';
import { SubscriptionScheduleFields } from './components/subscription-schedule-fields';

interface Props {
  opened: boolean;
  studentId: string;
  subscription?: StudentSubscription;
  initialDate?: Date;
  onClose: () => void;
}

export function StudentSubscriptionDrawer({ opened, onClose, studentId, subscription, initialDate }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const { user } = useAuth();
  const isWhiteSidebarColor = user?.space?.personalization?.is_white_sidebar_color ?? false;

  const {
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
    removeLesson
  } = useSubscriptionDrawerLogic({ 
    studentId, 
    subscription, 
    initialDate, 
    opened, 
    onClose 
  });

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
            <SubscriptionTypeSection 
              form={form} 
              templates={templates} 
              isEditMode={!!subscription} 
            />
          )}

          {(form.values.subscription_type === 'custom' || form.values.subscription_id) && (
            <>
              <SubscriptionPaymentFields
                form={form}
                currentPrice={currentData.price}
                isManualNextPayment={is_manual_next_payment_date}
                setIsManualNextPayment={set_is_manual_next_payment_date}
              />

              <SubscriptionScheduleFields
                form={form}
                lessons={lessons}
                currentLessonsCount={currentData.lessons_count}
                isWhiteSidebarColor={isWhiteSidebarColor}
                handleCalendarChange={handleCalendarChange}
                updateLessonTime={updateLessonTime}
                removeLesson={removeLesson}
              />

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
