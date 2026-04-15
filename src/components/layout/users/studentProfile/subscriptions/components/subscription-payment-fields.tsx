'use client';

import { Stack, Divider, Group, Select, NumberInput, Box, Switch, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useTranslations, useLocale } from 'next-intl';
import { UseFormReturnType } from '@mantine/form';

interface Props {
  form: UseFormReturnType<any>;
  currentPrice: number;
  isManualNextPayment: boolean;
  setIsManualNextPayment: (val: boolean) => void;
}

export function SubscriptionPaymentFields({ form, currentPrice, isManualNextPayment, setIsManualNextPayment }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');
  const locale = useLocale();

  return (
    <Stack gap="md">
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
            max={currentPrice}
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

      <Group grow align="center">
        <DatePickerInput
          label={t('form.next_payment_date') || 'Next payment date'}
          locale={locale}
          clearable
          {...form.getInputProps('next_payment_date')}
          onChange={(val) => {
            form.setFieldValue('next_payment_date', val as any);
            setIsManualNextPayment(true);
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
    </Stack>
  );
}
