import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileActions } from '../actions/file-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

interface Props {
  page: number;
  limit: number;
  search: string;
  category_ids?: string[];
}

export function useFiles({ page, limit, search, category_ids }: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials.file.notifications');

  const { data, isLoading } = useQuery({
    queryKey: ['files', page, limit, search, category_ids],
    queryFn: () => fileActions.get_files({ page, limit, search, category_ids }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; file: File; categories?: string[]; onProgress?: (e: any) => void }) => 
      fileActions.create_file({ name: data.name, file: data.file, categories: data.categories }, data.onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: t('upload_error'),
        color: 'red',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; file?: File; categories?: string[]; onProgress?: (e: any) => void }) => 
      fileActions.update_file(data.id, { name: data.name, file: data.file, categories: data.categories }, data.onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: t('update_error'),
        color: 'red',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fileActions.delete_file(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
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
    mutationFn: (ids: string[]) => fileActions.bulk_delete_files(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      notifications.show({
        title: 'Success',
        message: t('bulk_delete_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: t('bulk_delete_error'),
        color: 'red',
      });
    }
  });

  return {
    files: data?.data || [],
    total_pages: data?.meta.total_pages || 1,
    is_loading: isLoading,
    is_uploading: createMutation.isPending,
    is_updating: updateMutation.isPending,
    is_deleting: deleteMutation.isPending,
    is_bulk_deleting: bulkDeleteMutation.isPending,
    create_file: createMutation.mutateAsync,
    update_file: updateMutation.mutateAsync,
    delete_file: deleteMutation.mutateAsync,
    bulk_delete: bulkDeleteMutation.mutateAsync,
  };
}
