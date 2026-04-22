'use client';

import { useQuery } from '@tanstack/react-query';
import { storageActions } from '../actions/storage-actions';
import { queryKeys } from '@/lib/query-keys';

export const useStorageStats = () => {
  const statsQuery = useQuery({
    queryKey: ['storage', 'stats'],
    queryFn: () => storageActions.get_storage_stats(),
    staleTime: 5 * 60 * 1000,
  });

  const topFilesQuery = useQuery({
    queryKey: ['storage', 'top-files'],
    queryFn: () => storageActions.get_top_files(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: statsQuery.data,
    top_files: topFilesQuery.data,
    is_loading: statsQuery.isLoading || topFilesQuery.isLoading,
    is_error: statsQuery.isError || topFilesQuery.isError,
    refresh: () => {
      statsQuery.refetch();
      topFilesQuery.refetch();
    },
  };
};
