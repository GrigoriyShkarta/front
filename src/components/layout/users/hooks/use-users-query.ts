import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { userActions } from '../actions/user-actions';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';

export const useUsersQuery = (params?: Record<string, any>) => {
  const t = useTranslations('Common');
  const query_client = useQueryClient();
  const { user: current_user } = useAuth();

  const users_query = useQuery({
    queryKey: ['users', params],
    queryFn: () => userActions.get_users(params),
  });

  const users_list = users_query.data?.data || [];
  const meta = users_query.data?.meta;

  const teachers = useMemo(() => {
    // 1. Get all teachers and super_admins from the list
    const list = users_list
      .filter(u => u.role === 'teacher' || u.role === 'super_admin')
      .map(u => ({ id: u.id, name: u.name, role: u.role }));
    
    // 2. Add current user if they are a teacher or super_admin and not already in list
    if (current_user && 
       (current_user.role === 'teacher' || current_user.role === 'super_admin') && 
       !list.find(t => t.id === current_user.id)) {
      list.push({ id: current_user.id, name: current_user.name, role: current_user.role as any });
    }

    // 3. IMPORTANT: If current user is an Admin, they should see their own Super Admin (the space owner)
    // Check teacher object first, then fallback to super_admin_id
    const user_teacher = (current_user as any)?.teacher;
    const super_admin_id = (current_user as any)?.super_admin_id;

    if (user_teacher && !list.find(t => t.id === user_teacher.id)) {
      list.push({ 
        id: user_teacher.id, 
        name: user_teacher.name, 
        role: 'super_admin'
      });
    } else if (super_admin_id && !list.find(t => t.id === super_admin_id)) {
      list.push({
        id: super_admin_id,
        name: t('roles.super_admin'),
        role: 'super_admin'
      });
    }
    
    return list;
  }, [users_list, current_user, t]);

  const create_user_mutation = useMutation({
    mutationFn: userActions.create_user,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: t('success'),
        message: t('user_created_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: t('error'),
        message: t('user_created_error'),
        color: 'red',
      });
    }
  });

  const update_user_mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userActions.update_user(id, data),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: t('success'),
        message: t('user_updated_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: t('error'),
        message: t('user_updated_error'),
        color: 'red',
      });
    }
  });

  const delete_user_mutation = useMutation({
    mutationFn: userActions.delete_user,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: t('success'),
        message: t('user_deleted_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: t('error'),
        message: t('user_deleted_error'),
        color: 'red',
      });
    }
  });

  const bulk_delete_mutation = useMutation({
    mutationFn: userActions.delete_users,
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['users'] });
      notifications.show({
        title: t('success'),
        message: t('users_deleted_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: t('error'),
        message: t('users_deleted_error'),
        color: 'red',
      });
    }
  });

  return {
    users: users_list,
    meta,
    is_loading: users_query.isLoading,
    is_error: users_query.isError,
    teachers,
    current_user,
    create_user: create_user_mutation.mutateAsync,
    update_user: update_user_mutation.mutateAsync,
    delete_user: delete_user_mutation.mutateAsync,
    bulk_delete: bulk_delete_mutation.mutateAsync,
    is_mutating: create_user_mutation.isPending || update_user_mutation.isPending || delete_user_mutation.isPending || bulk_delete_mutation.isPending,
  };
};
