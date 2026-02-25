import { 
  Group, Stack, Text, Select, NumberInput, Button, Badge, Grid, Tooltip, Paper, Divider 
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import { IoCalendarOutline, IoNotificationsOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import { useState } from 'react';
import { StudentSubscription } from '../schemas/student-subscription-schema';

import { UpdateSubscriptionData } from './types';

interface Props {
  sub: StudentSubscription;
  isTeacher: boolean;
  onUpdate: (args: { id: string; data: UpdateSubscriptionData }) => Promise<any>;
}

export function SubscriptionPaymentSection({ sub, isTeacher, onUpdate }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();

  const [editData, setEditData] = useState<{
    status: string;
    paid_amount: number;
    partial_payment_date: Date | null;
  } | null>(null);

  const handleStatusChange = (val: string) => {
    if (val === 'partially_paid') {
      setEditData({
        status: 'partially_paid',
        paid_amount: sub.paid_amount,
        partial_payment_date: sub.partial_payment_date ? new Date(sub.partial_payment_date) : null
      });
    } else {
      setEditData(null);
      onUpdate({ id: sub.id, data: { payment_status: val } });
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    await onUpdate({
      id: sub.id,
      data: {
        payment_status: editData.status,
        paid_amount: editData.paid_amount,
        partial_payment_date: editData.partial_payment_date ? dayjs(editData.partial_payment_date).toISOString() : null
      }
    });
    setEditData(null);
  };

  return (
    <Paper bg="white/3" radius="md">
      <Grid align="flex-start" style={{ width: '700px' }}>
        <Grid.Col span={12}>
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Stack gap={4} flex={1}>
                {isTeacher ? (
                  <>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">{common_t('payment_status')}</Text>
                    <Select
                      size="xs"
                      variant="filled"
                      data={[
                        { value: 'paid', label: common_t('payment_statuses.paid') },
                        { value: 'unpaid', label: common_t('payment_statuses.unpaid') },
                        { value: 'partially_paid', label: common_t('payment_statuses.partially_paid') },
                      ]}
                      value={editData?.status || sub.payment_status}
                      onChange={(val) => handleStatusChange(val || '')}
                      style={{ maxWidth: 200 }}
                    />
                  </>
                ) : (
                  <Badge variant="light" color={sub.payment_status === 'paid' ? 'green' : 'orange'} size="lg">
                    {common_t(`payment_statuses.${sub.payment_status}`)}
                  </Badge>
                )}
              </Stack>

              {isTeacher && sub.payment_reminder && (
                <Tooltip label={t('form.payment_reminder')}>
                  <Group gap={4} className="text-yellow-400">
                    <IoNotificationsOutline size={16} />
                    <Text size="xs" fw={600}>1w reminder</Text>
                  </Group>
                </Tooltip>
              )}
            </Group>

            <Divider variant="dashed" color="white/5" />

            <Group justify="space-between" align="flex-end">
              <Stack gap={8}>
                {editData ? (
                  <Group gap="xs">
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="dimmed">{common_t('paid_amount')}</Text>
                      <NumberInput
                        size="xs"
                        placeholder={common_t('paid_amount')}
                        value={editData.paid_amount}
                        onChange={(val) => setEditData(prev => prev ? { ...prev, paid_amount: Number(val) } : null)}
                        style={{ width: 120 }}
                      />
                    </Stack>
                    <Stack gap={2}>
                      <Text size="xs" fw={700} c="dimmed">{t('form.partial_payment_date')}</Text>
                      <DatePickerInput
                        size="xs"
                        locale={locale}
                        placeholder={t('form.partial_payment_date')}
                        value={editData.partial_payment_date}
                        onChange={(val) => setEditData(prev => prev ? { ...prev, partial_payment_date: val as Date | null } : null)}
                        style={{ width: 150 }}
                      />
                    </Stack>
                    <Button size="xs" mt="lg" onClick={handleSave}>
                      {common_t('save')}
                    </Button>
                  </Group>
                ) : (
                  <>
                    {sub.payment_status === 'partially_paid' && (
                      <Group gap="xl">
                        <Stack gap={2}>
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase">{common_t('paid_amount')}</Text>
                          <Text size="sm" fw={600} color="orange.4">{sub.paid_amount} / {sub.price} ₴</Text>
                        </Stack>
                        <Stack gap={2}>
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase">{t('form.partial_payment_date')}</Text>
                          {sub.partial_payment_date ? (
                            <Badge size="sm" variant="dot" color="orange">
                              {dayjs(sub.partial_payment_date).locale(locale).format('DD MMM YYYY')}
                            </Badge>
                          ) : (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                        </Stack>
                      </Group>
                    )}
                  </>
                )}

                {sub.next_payment_date && (
                  <Group gap={6}>
                    <IoCalendarOutline size={14} color="var(--space-primary)" />
                    <Text size="xs" fw={600}>{t('form.next_payment_date')}:</Text>
                    <Text size="xs" fw={700} color="var(--space-primary)">
                      {dayjs(sub.next_payment_date).locale(locale).format('DD MMM YYYY')}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
