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
          student_id: subscription.student_id || '',
        });
      } else {
        reset({
          name: '',
          lessons_count: undefined,
          price: undefined,
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
            error={errors.name?.message ? common_t(`errors.${errors.name.message as any}`) : null}
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
                error={errors.lessons_count?.message ? common_t(`errors.${errors.lessons_count.message as any}`) : null}
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
                error={errors.price?.message ? common_t(`errors.${errors.price.message as any}`) : null}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {common_t('save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
