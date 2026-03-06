'use client';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Group, Text, Button, ActionIcon, CloseButton, Transition, Box, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IoCardOutline, IoCloseOutline, IoAlertCircleOutline } from 'react-icons/io5';
import { useAuthContext } from '@/context/auth-context';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';

/**
 * PaymentReminder component - Shows a notification card in the bottom-right corner 
 * when the user's payment_reminder_date is approaching (within 7 days).
 */
export function PaymentReminder() {
  const tPayment = useTranslations('Common.payment_reminder');
  const tDeactivation = useTranslations('Common.deactivation_reminder');
  
  const { user } = useAuthContext();
  const [opened, { close, open }] = useDisclosure(false);
  
  const [active_reminder, set_active_reminder] = useState<{
    type: 'payment' | 'deactivation';
    date: string;
  } | null>(null);

  useEffect(() => {
    if (user?.role !== 'student') {
      set_active_reminder(null);
      close();
      return;
    }

    const now = dayjs();
    
    // 1. Check Deactivation Priority
    if (user.deactivation_date) {
      const deactivation_date = dayjs(user.deactivation_date);
      const diff_deact = deactivation_date.diff(now, 'day');
      
      if (diff_deact <= 7) {
        set_active_reminder({ type: 'deactivation', date: user.deactivation_date });
        const timer = setTimeout(open, 1000);
        return () => clearTimeout(timer);
      }
    }

    // 2. Check Payment Priority
    if (user.payment_reminder_date) {
      const payment_date = dayjs(user.payment_reminder_date);
      const diff_pay = payment_date.diff(now, 'day');
      
      if (diff_pay <= 7) {
        set_active_reminder({ type: 'payment', date: user.payment_reminder_date });
        const timer = setTimeout(open, 1000);
        return () => clearTimeout(timer);
      }
    }

    set_active_reminder(null);
    close();
  }, [user?.payment_reminder_date, user?.deactivation_date, user?.role, open, close]);

  if (!active_reminder) return null;

  const t = active_reminder.type === 'deactivation' ? tDeactivation : tPayment;
  const formatted_date = dayjs(active_reminder.date).format('DD.MM.YYYY');

  return (
    <Transition mounted={opened} transition="slide-up" duration={400} timingFunction="ease">
      {(styles) => (
        <Paper
          shadow="xl"
          p="md"
          radius="lg"
          withBorder
          className="fixed bottom-6 right-6 z-[200] w-[320px] backdrop-blur-md"
          style={{
            ...styles,
            backgroundColor: 'rgba(var(--mantine-color-body-rgb), 0.8)',
            borderColor: 'var(--space-primary)',
            borderWidth: rem(2),
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <Box className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <IoAlertCircleOutline size={22} />
                </Box>
                <Text fw={700} size="sm">
                  {t('title')}
                </Text>
              </Group>
              <CloseButton 
                onClick={close} 
                size="sm" 
                variant="subtle" 
                color="gray"
              />
            </Group>

            <Text size="xs" c="dimmed" lh={1.4}>
              {t('description', { date: formatted_date })}
            </Text>
          </Stack>
        </Paper>
      )}
    </Transition>
  );
}
