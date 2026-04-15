'use client';

import { Stack, SegmentedControl, Select, TextInput, Group, NumberInput } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { UseFormReturnType } from '@mantine/form';

interface Props {
  form: UseFormReturnType<any>;
  templates: any[];
  isEditMode: boolean;
}

export function SubscriptionTypeSection({ form, templates, isEditMode }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');

  return (
    <Stack gap="md">
      {!isEditMode && (
        <SegmentedControl
          fullWidth
          value={form.values.subscription_type}
          onChange={(val) => form.setFieldValue('subscription_type', val as 'template' | 'custom')}
          data={[
            { label: t('template_subscription'), value: 'template' },
            { label: t('individual_subscription'), value: 'custom' },
          ]}
          styles={{
            indicator: {
              backgroundColor: 'var(--space-accent)',
            }
          }}
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
          disabled={isEditMode}
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
    </Stack>
  );
}
