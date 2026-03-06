import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { materialsActions } from '../actions/materials-actions';
import { GrantAccessForm, RevokeAccessForm } from '../schemas/materials-schema';

type MaterialType = 'audio' | 'photo' | 'video' | 'file';

export function useStudentMaterialsData(student_id: string, type: MaterialType) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [category_ids, setCategoryIds] = useState<string[]>([]);

  const queryKey = [`student-${type}s`, student_id, page, search, limit, category_ids];
  
  const getAction = () => {
    switch (type) {
      case 'audio': return materialsActions.get_student_audios;
      case 'photo': return materialsActions.get_student_photos;
      case 'video': return materialsActions.get_student_videos;
      case 'file': return materialsActions.get_student_files;
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => getAction()(student_id, { page, limit, search, category_ids }),
    enabled: !!student_id,
  });

  const grantAccessMutation = useMutation({
    mutationFn: (data: GrantAccessForm) => materialsActions.grant_access(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`student-${type}s`, student_id] });
      notifications.show({
        title: t('access.notifications.access_granted') || 'Access updated',
        message: '',
        color: 'green',
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('access.notifications.access_error') || 'Error updating access',
        message: error?.response?.data?.message || error?.message,
        color: 'red',
      });
    },
  });

  const revokeAccessMutation = useMutation({
    mutationFn: (data: RevokeAccessForm) => materialsActions.revoke_access(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`student-${type}s`, student_id] });
    },
    onError: (error: any) => {
      notifications.show({
        title: t('access.notifications.access_error') || 'Error updating access',
        message: error?.response?.data?.message || error?.message,
        color: 'red',
      });
    },
  });

  return {
    items: data?.data || [],
    is_loading: isLoading,
    total_pages: data?.meta.total_pages || 1,
    total_items: data?.meta.total_items || 0,
    page,
    search,
    limit,
    category_ids,
    is_granting: grantAccessMutation.isPending,
    is_revoking: revokeAccessMutation.isPending,
    setPage,
    setSearch,
    setLimit,
    setCategoryIds,
    grant_access: grantAccessMutation.mutateAsync,
    revoke_access: revokeAccessMutation.mutateAsync,
    refresh: refetch,
  };
}
