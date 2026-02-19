import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { photoActions } from '../actions/photo-actions';
import { queryKeys } from '@/lib/query-keys';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

export const usePhotos = (filters: any = {}) => {
  const t = useTranslations('Materials.photo');
  const common_t = useTranslations('Common');
  const query_client = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.materials.images.list(filters),
    queryFn: () => photoActions.get_photos(filters),
  });

  const upload_mutation = useMutation({
    mutationFn: (data: { name: string; file: File; categories?: string[]; onProgress?: (p: any) => void }) => 
      photoActions.create_photo({ name: data.name, file: data.file, categories: data.categories }, data.onProgress),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.images.all() });
    },
    onError: (error: any) => {
      notifications.show({
        title: common_t('error'),
        message: error.response?.data?.message || t('notifications.upload_error'),
        color: 'red',
      });
    }
  });

  const update_mutation = useMutation({
    mutationFn: (data: { id: string; name?: string; file?: File; categories?: string[]; onProgress?: (p: any) => void }) => 
      photoActions.update_photo(data.id, { name: data.name, file: data.file, categories: data.categories }, data.onProgress),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.images.all() });
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
    mutationFn: photoActions.delete_photo,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.images.all() });
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
    mutationFn: photoActions.bulk_delete_photos,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.images.all() });
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
    photos: query.data?.data || [],
    total: query.data?.meta.total_items || 0,
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_uploading: upload_mutation.isPending,
    is_updating: update_mutation.isPending,
    is_deleting: delete_mutation.isPending,
    is_bulk_deleting: bulk_delete_mutation.isPending,
    total_pages: query.data?.meta.total_pages || 1,
    upload_photo: upload_mutation.mutateAsync,
    update_photo: update_mutation.mutateAsync,
    delete_photo: delete_mutation.mutateAsync,
    bulk_delete: bulk_delete_mutation.mutateAsync,
    refetch: query.refetch,
  };
};
