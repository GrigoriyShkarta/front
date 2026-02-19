'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Stack, 
  PasswordInput, 
  Button, 
  Group, 
  Paper,
  Text
} from '@mantine/core';
import { change_password_schema, ChangePasswordData } from '../schemas/profile-schema';
import { useTranslations } from 'next-intl';

interface Props {
  on_submit: (data: ChangePasswordData) => Promise<void>;
  is_loading: boolean;
}

/**
 * Form for changing user password.
 * Includes current password verification and new password confirmation.
 */
export function SecurityForm({ on_submit, is_loading }: Props) {
  const t = useTranslations('Profile');
  const common_t = useTranslations('Common');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(change_password_schema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    mode: 'onChange',
  });

  const handle_form_submit = async (data: ChangePasswordData) => {
    try {
      await on_submit(data);
      reset();
    } catch (error: any) {
      const server_errors = error.response?.data?.message;
      if (Array.isArray(server_errors)) {
        server_errors.forEach((err_obj: any) => {
          Object.entries(err_obj).forEach(([field, message]) => {
            setError(field as any, { 
              type: 'server', 
              message: `errors.${message}`
            });
          });
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handle_form_submit)}>
      <Paper withBorder p="lg" radius="md" className="bg-white/5 border-white/10 max-w-xl">
        <Stack gap="md">
          <Text fw={600} size="lg" mb="xs">{t('security_title')}</Text>
          
          <PasswordInput
            label={t('fields.current_password')}
            placeholder={t('placeholders.current_password')}
            required
            withAsterisk
            {...register('current_password')}
            error={errors.current_password?.message && common_t(errors.current_password.message)}
          />

          <PasswordInput
            label={t('fields.new_password')}
            placeholder={t('placeholders.new_password')}
            required
            withAsterisk
            {...register('new_password')}
            error={errors.new_password?.message && common_t(errors.new_password.message)}
          />

          <PasswordInput
            label={t('fields.confirm_password')}
            placeholder={t('placeholders.confirm_password')}
            required
            withAsterisk
            {...register('confirm_password')}
            error={errors.confirm_password?.message && (errors.confirm_password.message === 'Profile.errors.passwords_do_not_match' ? t('errors.passwords_do_not_match') : common_t(errors.confirm_password.message))}
          />

          <Group justify="flex-end" mt="md">
            <Button 
              type="submit" 
              loading={is_loading} 
              disabled={!isDirty || !isValid || is_loading}
              className="px-8 shadow-sm"
            >
              {t('actions.change_password')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
