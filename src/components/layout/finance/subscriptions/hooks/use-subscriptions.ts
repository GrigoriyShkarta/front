import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionActions } from '../actions/subscription-actions';
import { queryKeys } from '@/lib/query-keys';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { SubscriptionFormData } from '../schemas/subscription-schema';

export const useSubscriptions = (filters: any = {}) => {
  const t = useTranslations('Finance.subscriptions');
  const common_t = useTranslations('Common');
  const query_client = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.finance.subscriptions.list(filters),
    queryFn: () => subscriptionActions.get_subscriptions(filters),
  });

  const create_mutation = useMutation({
    mutationFn: (data: SubscriptionFormData) => 
      subscriptionActions.create_subscription(data),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.all() });
      notifications.show({
        title: common_t('success'),
        message: t('notifications.create_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error.response?.data?.message || t('notifications.create_error'),
        color: 'red',
      });
    }
  });

  const update_mutation = useMutation({
    mutationFn: (data: { id: string; data: Partial<SubscriptionFormData> }) => 
      subscriptionActions.update_subscription(data.id, data.data),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.all() });
      notifications.show({
        title: common_t('success'),
        message: t('notifications.update_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
       notifications.show({
        title: common_t('error'),
        message: error.response?.data?.message || t('notifications.update_error'),
        color: 'red',
      });
    }
  });

  const delete_mutation = useMutation({
    mutationFn: subscriptionActions.delete_subscription,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.all() });
      notifications.show({
        title: common_t('success'),
        message: t('notifications.delete_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error.response?.data?.message || t('notifications.delete_error'),
        color: 'red',
      });
    }
  });

  const bulk_delete_mutation = useMutation({
    mutationFn: subscriptionActions.bulk_delete_subscriptions,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.finance.subscriptions.all() });
      notifications.show({
        title: common_t('success'),
        message: t('notifications.bulk_delete_success'),
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error.response?.data?.message || t('notifications.bulk_delete_error'),
        color: 'red',
      });
    }
  });

  return {
    subscriptions: query.data?.data || [],
    total: query.data?.meta.total_items || 0,
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_creating: create_mutation.isPending,
    is_updating: update_mutation.isPending,
    is_deleting: delete_mutation.isPending,
    is_bulk_deleting: bulk_delete_mutation.isPending,
    total_pages: query.data?.meta.total_pages || 1,
    create_subscription: create_mutation.mutateAsync,
    update_subscription: update_mutation.mutateAsync,
    delete_subscription: delete_mutation.mutateAsync,
    bulk_delete: bulk_delete_mutation.mutateAsync,
    refetch: query.refetch,
  };
};
