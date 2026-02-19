import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonActions } from '../actions/lesson-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  page: number;
  limit: number;
  search: string;
  category_ids?: string[];
}

export function useLessons({ page, limit, search, category_ids }: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.lessons.notifications');

  const { data, isLoading } = useQuery({
    queryKey: ['lessons', page, limit, search, category_ids],
    queryFn: () => lessonActions.get_lessons({ page, limit, search, category_ids }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => lessonActions.delete_lesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
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
    mutationFn: (ids: string[]) => lessonActions.bulk_delete_lessons(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
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
    lessons: data?.data || [],
    total_pages: data?.meta.total_pages || 1,
    is_loading: isLoading,
    is_deleting: deleteMutation.isPending,
    is_bulk_deleting: bulkDeleteMutation.isPending,
    delete_lesson: deleteMutation.mutateAsync,
    bulk_delete: bulkDeleteMutation.mutateAsync,
  };
}
