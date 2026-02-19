import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoActions } from '../actions/video-actions';
import { queryKeys } from '@/lib/query-keys';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

export const useVideos = (filters: any = {}) => {
  const t = useTranslations('Materials.video');
  const common_t = useTranslations('Common');
  const query_client = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.materials.videos.list(filters),
    queryFn: () => videoActions.get_videos(filters),
  });

  const upload_mutation = useMutation({
    mutationFn: (data: { name: string; file?: File; youtube_url?: string; categories?: string[]; onProgress?: (p: any) => void }) => 
      videoActions.create_video({ 
        name: data.name, 
        file: data.file, 
        youtube_url: data.youtube_url,
        categories: data.categories 
      }, data.onProgress),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.videos.all() });
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
    mutationFn: (data: { id: string; name?: string; file?: File; youtube_url?: string; categories?: string[]; onProgress?: (p: any) => void }) => 
      videoActions.update_video(data.id, { 
        name: data.name, 
        file: data.file, 
        youtube_url: data.youtube_url,
        categories: data.categories 
      }, data.onProgress),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.videos.all() });
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
    mutationFn: videoActions.delete_video,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.videos.all() });
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
    mutationFn: videoActions.bulk_delete_videos,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.videos.all() });
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
    videos: query.data?.data || [],
    total: query.data?.meta.total_items || 0,
    is_loading: query.isLoading,
    is_fetching: query.isFetching,
    is_uploading: upload_mutation.isPending,
    is_updating: update_mutation.isPending,
    is_deleting: delete_mutation.isPending,
    is_bulk_deleting: bulk_delete_mutation.isPending,
    total_pages: query.data?.meta.total_pages || 1,
    create_video: upload_mutation.mutateAsync,
    update_video: update_mutation.mutateAsync,
    delete_video: delete_mutation.mutateAsync,
    bulk_delete: bulk_delete_mutation.mutateAsync,
    refetch: query.refetch,
  };
};
