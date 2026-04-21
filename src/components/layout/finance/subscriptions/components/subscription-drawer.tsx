'use client';

import { 
  Drawer, 
  Stack, 
  TextInput, 
  Button, 
  Group, 
  NumberInput,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SubscriptionMaterial, subscription_form_schema, SubscriptionFormData } from '../schemas/subscription-schema';
import { useAuth } from '@/hooks/use-auth';
import { getCurrencySymbol } from '@/lib/constants';

interface Props {
  opened: boolean;
  onClose: () => void;
  subscription?: SubscriptionMaterial | null; // If present, we are editing
  on_submit: (data: SubscriptionFormData) => Promise<void>;
  is_loading: boolean;
}

export function SubscriptionDrawer({ opened, onClose, subscription, on_submit, is_loading }: Props) {
  const t = useTranslations('Finance.subscriptions');
  const common_t = useTranslations('Common');
  const { user } = useAuth();
  const currencySymbol = getCurrencySymbol(user?.space?.personalization?.currency);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid }
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscription_form_schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      lessons_count: undefined,
      price: undefined,
      lesson_duration: 50,
      student_id: '',
    },
  });

  useEffect(() => {
    if (opened) {
      if (subscription) {
        reset({
          name: subscription.name,
          lessons_count: subscription.lessons_count,
          price: subscription.price,
          lesson_duration: subscription.lesson_duration || 50,
          student_id: subscription.student_id || '',
        });
      } else {
        reset({
          name: '',
          lessons_count: undefined,
          price: undefined,
          lesson_duration: 50,
          student_id: '',
        });
      }
    }
  }, [opened, subscription, reset]);

  const handle_submit = async (values: SubscriptionFormData) => {
    // Backend doesn't need student_id if it's empty string
    const data = { ...values };
    if (!data.student_id) delete data.student_id;
    await on_submit(data);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={subscription ? t('edit_subscription') : t('add_subscription')}
      position="right"
      size="md"
      classNames={{
        header: 'px-6 py-4',
        content: 'transition-colors duration-300',
        body: 'p-6'
      }}
      styles={{
        header: { 
          backgroundColor: 'var(--mantine-color-body)', 
        },
        content: { 
          backgroundColor: 'var(--mantine-color-body)', 
          color: 'var(--foreground)'
        }
      }}
    >
      <form onSubmit={handleSubmit(handle_submit)}>
        <Stack gap="xl">
          <TextInput
            label={t('table.name')}
            placeholder={t('form.name_placeholder')}
            required
            error={errors.name?.message ? t(`validation.${errors.name.message as any}`) : null}
            {...register('name')}
            variant="filled"
          />

          <Controller
            name="lessons_count"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={t('form.lessons_count')}
                placeholder={t('form.lessons_count_placeholder')}
                required
                min={1}
                allowLeadingZeros={false}
                value={field.value}
                onChange={field.onChange}
                error={errors.lessons_count?.message ? t(`validation.${errors.lessons_count.message as any}`) : null}
                variant="filled"
              />
            )}
          />

          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={t('form.price')}
                placeholder={t('form.price_placeholder')}
                required
                min={0}
                decimalScale={2}
                allowLeadingZeros={false}
                value={field.value}
                onChange={field.onChange}
                error={errors.price?.message ? t(`validation.${errors.price.message as any}`) : null}
                variant="filled"
                rightSection={currencySymbol}
              />
            )}
          />

          <Controller
            name="lesson_duration"
            control={control}
            render={({ field }) => (
              <NumberInput
                label={t('form.lesson_duration') || 'Lesson duration (min)'}
                placeholder={t('form.lesson_duration_placeholder') || '50'}
                required
                min={1}
                allowLeadingZeros={false}
                value={field.value}
                onChange={field.onChange}
                error={errors.lesson_duration?.message ? t(`validation.${errors.lesson_duration.message as any}`) : null}
                variant="filled"
              />
            )}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
              {common_t('cancel')}
            </Button>
            <Button
              type="submit"
              loading={is_loading}
              disabled={!isValid || is_loading}
              color="primary"
              className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              {common_t('save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
