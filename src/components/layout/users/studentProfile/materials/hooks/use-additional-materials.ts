import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { materialsActions } from '../actions/materials-actions';
import { GrantAccessForm, RevokeAccessForm } from '../schemas/materials-schema';

export function useAdditionalMaterials(student_id: string) {
  const queryClient = useQueryClient();
  const t = useTranslations('Materials');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [category_ids, setCategoryIds] = useState<string[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['student-additional-materials', student_id, page, search, limit, category_ids],
    queryFn: () => materialsActions.get_additional_lessons(student_id, { page, limit, search, category_ids }),
    enabled: !!student_id,
  });

  const grantAccessMutation = useMutation({
    mutationFn: (data: GrantAccessForm) => materialsActions.grant_access(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-additional-materials', student_id] });
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
      queryClient.invalidateQueries({ queryKey: ['student-additional-materials', student_id] });
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
    lessons: data?.data || [],
    is_loading: isLoading,
    total_pages: data?.meta.total_pages || 1,
    total_items: data?.meta.total_items || 0,
    page,
    setPage,
    search,
    setSearch,
    limit,
    setLimit,
    category_ids,
    setCategoryIds,
    grant_access: grantAccessMutation.mutateAsync,
    is_granting: grantAccessMutation.isPending,
    revoke_access: revokeAccessMutation.mutateAsync,
    is_revoking: revokeAccessMutation.isPending,
    refresh: refetch,
  };
}
