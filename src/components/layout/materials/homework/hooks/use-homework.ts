import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { homeworkActions } from '@/components/layout/materials/homework/actions/homework-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  page?: number;
  limit?: number;
  search?: string;
  lesson_id?: string;
}

export function useHomework({ page = 1, limit = 10, search = '', lesson_id }: Props = {}) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.homework.notifications');

  const { data, isLoading } = useQuery({
    queryKey: ['homeworks', page, limit, search, lesson_id],
    queryFn: () => homeworkActions.get_homeworks({ page, limit, search, lesson_id }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => homeworkActions.delete_homework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworks'] });
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
    mutationFn: (ids: string[]) => homeworkActions.bulk_delete_homeworks(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworks'] });
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
    homeworks: data?.data || [],
    meta: data?.meta,
    is_loading: isLoading,
    total_pages: data?.meta?.total_pages || 1,
    delete_homework: deleteMutation.mutateAsync,
    bulk_delete_homeworks: bulkDeleteMutation.mutateAsync,
    is_deleting: deleteMutation.isPending,
    is_bulk_deleting: bulkDeleteMutation.isPending,
  };
}
