'use client';

import { useQuery } from '@tanstack/react-query';
import { homeworkActions } from '../actions/homework-actions';
import { HomeworkMaterial } from '../schemas/homework-schema';

interface UseHomeworksAllParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string | null;
}

/**
 * Hook for fetching all homeworks with pagination for admin/teacher review page.
 * @param params - Search, page, limit, status
 * @returns Paginated homework list
 */
export function useHomeworksAll({ search = '', page = 1, limit = 15, status }: UseHomeworksAllParams = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ['homeworks_all_review', search, page, limit, status],
    queryFn: () => homeworkActions.get_homeworks({ search, page, limit, status }),
  });

  return {
    homeworks: (data?.data ?? []) as HomeworkMaterial[],
    meta: data?.meta,
    total_pages: data?.meta?.total_pages ?? 1,
    is_loading: isLoading,
  };
}
