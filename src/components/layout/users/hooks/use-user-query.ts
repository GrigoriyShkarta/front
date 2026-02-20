'use client';

import { useQuery } from '@tanstack/react-query';
import { userActions } from '../actions/user-actions';
import { queryKeys } from '@/lib/query-keys';

export const useUserQuery = (id: string) => {
  const query = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => userActions.get_user(id),
    enabled: !!id,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    is_loading: query.isLoading,
    is_error: query.isError,
    error: query.error,
    refresh: query.refetch,
  };
};
