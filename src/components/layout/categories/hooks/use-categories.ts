import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryActions } from '../actions/category-actions';
import { CreateCategoryForm } from '../schemas/category-schema';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

export function useCategories(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const t = useTranslations('Categories.notifications');
  const common_t = useTranslations('Common');

  const { data, isLoading } = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryActions.get_categories(params),
    placeholderData: (previousData) => previousData,
  });

  // Handle data processing (Server-side vs Client-side pagination)
  const raw_categories = data?.data || [];
  const meta = data?.meta;
  const is_server_pagination = !!meta;

  let categories = raw_categories;
  let total_pages = meta?.total_pages || 1;
  let total_items = meta?.total_items || raw_categories.length;

  // If backend doesn't support pagination (no meta), we do it client-side
  if (!is_server_pagination) {
    let filtered = raw_categories;
    
    // Client-side search
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = raw_categories.filter(c => c.name.toLowerCase().includes(q));
    }
    
    total_items = filtered.length;
    
    // Client-side pagination
    if (params?.page && params?.limit) {
      total_pages = Math.ceil(total_items / params.limit);
      const start = (params.page - 1) * params.limit;
      categories = filtered.slice(start, start + params.limit);
    } else {
      categories = filtered;
    }
  }

  const amazon_create = useMutation({
    mutationFn: (data: CreateCategoryForm[]) => categoryActions.create_categories(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({
        title: common_t('success'),
        message: t('create_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('create_error'),
        color: 'red',
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryForm) => categoryActions.create_category(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({
        title: common_t('success'),
        message: t('create_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('create_error'),
        color: 'red',
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<CreateCategoryForm> }) => 
      categoryActions.update_category(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({
        title: common_t('success'),
        message: t('update_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('update_error'),
        color: 'red',
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryActions.delete_category(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({
        title: common_t('success'),
        message: t('delete_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('delete_error'),
        color: 'red',
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => categoryActions.bulk_delete_categories(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({
        title: common_t('success'),
        message: t('bulk_delete_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: common_t('error'),
        message: t('bulk_delete_error'),
        color: 'red',
      });
    }
  });

  return {
    categories,
    total_pages,
    total_items,
    is_loading: isLoading,
    create_category: createMutation.mutateAsync,
    create_categories: amazon_create.mutateAsync,
    update_category: updateMutation.mutateAsync,
    delete_category: deleteMutation.mutateAsync,
    bulk_delete_categories: bulkDeleteMutation.mutateAsync,
    is_pending: createMutation.isPending || amazon_create.isPending || updateMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending,
  };
}
