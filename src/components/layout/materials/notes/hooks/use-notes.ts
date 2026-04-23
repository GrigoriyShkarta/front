import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteActions } from '../actions/note-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  page: number;
  limit: number;
  search: string;
  category_id?: string;
  student_id?: string;
}

export function useNotes({ page, limit, search, category_id, student_id }: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.notes.notifications');

  const { data, isLoading } = useQuery({
    queryKey: ['notes', page, limit, search, category_id, student_id],
    queryFn: () => noteActions.get_notes({ page, limit, search, category_id, student_id }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noteActions.delete_note(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    mutationFn: (ids: string[]) => noteActions.bulk_delete_notes(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
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
    notes: data?.data || [],
    total_pages: data?.meta?.total_pages || 1,
    is_loading: isLoading,
    is_deleting: deleteMutation.isPending,
    is_bulk_deleting: bulkDeleteMutation.isPending,
    delete_note: deleteMutation.mutateAsync,
    bulk_delete: bulkDeleteMutation.mutateAsync,
  };
}
