'use client';

import { useQuery } from '@tanstack/react-query';
import { userActions } from '../actions/user-actions';
import { queryKeys } from '@/lib/query-keys';

export const useStorageUsage = () => {
  const query = useQuery({
    queryKey: queryKeys.users.storageUsage(),
    queryFn: () => userActions.get_storage_usage(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  return {
    storage_usage: query.data,
    is_loading: query.isLoading,
    is_error: query.isError,
    error: query.error,
    refresh: query.refetch,
  };
};
