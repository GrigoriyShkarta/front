import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testActions } from '@/components/layout/materials/tests/actions/test-actions';import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export function useTests({ page = 1, limit = 10, search = '', category_ids = [] }: Props = {}) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.tests.notifications');

  const { data, isLoading } = useQuery({
    queryKey: ['tests', page, limit, search, category_ids],
    queryFn: () => testActions.get_tests({ page, limit, search, category_ids }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testActions.delete_test(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      notifications.show({
        title: 'Success',
        message: t('delete_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: t('delete_error'),
        color: 'red',
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => testActions.bulk_delete_tests(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      notifications.show({
        title: 'Success',
        message: t('delete_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: t('delete_error'),
        color: 'red',
      });
    }
  });

  return {
    tests: data?.data || [],
    meta: data?.meta,
    is_loading: isLoading,
    total_pages: data?.meta.total_pages || 1,
    delete_test: deleteMutation.mutate,
    bulk_delete_tests: bulkDeleteMutation.mutate,
  };
}
