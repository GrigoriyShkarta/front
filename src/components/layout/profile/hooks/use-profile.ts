import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileActions } from '../actions/profile-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/lib/query-keys';

export const useProfile = () => {
  const t = useTranslations('Profile');
  const common_t = useTranslations('Common');
  const query_client = useQueryClient();

  const update_profile_mutation = useMutation({
    mutationFn: profileActions.update_profile,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.auth.user() });
      notifications.show({
        title: common_t('success'),
        message: t('update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      const server_message = error.response?.data?.message;
      const display_message = typeof server_message === 'string' ? server_message : t('update_error');
      
      notifications.show({
        title: common_t('error'),
        message: display_message,
        color: 'red',
      });
    }
  });

  const change_password_mutation = useMutation({
    mutationFn: profileActions.change_password,
    onSuccess: () => {
      notifications.show({
        title: common_t('success'),
        message: t('password_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      const server_message = error.response?.data?.message;
      const display_message = typeof server_message === 'string' ? server_message : t('password_error');

      notifications.show({
        title: common_t('error'),
        message: display_message,
        color: 'red',
      });
    }
  });

  return {
    update_profile: update_profile_mutation.mutateAsync,
    is_updating: update_profile_mutation.isPending,
    change_password: change_password_mutation.mutateAsync,
    is_changing_password: change_password_mutation.isPending,
  };
};
