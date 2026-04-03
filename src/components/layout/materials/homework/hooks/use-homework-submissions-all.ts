'use client';

import { useQuery } from '@tanstack/react-query';
import { homeworkActions } from '../actions/homework-actions';
import { HomeworkSubmission } from '../actions/homework-submission-actions';

interface UseHomeworkSubmissionsAllParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string | null;
}

/**
 * Hook for fetching all submissions across all homeworks for administration.
 * @param params - Search, page, limit, status
 * @returns Paginated submissions list and stats
 */
export function useHomeworkSubmissionsAll({ search = '', page = 1, limit = 15, status }: UseHomeworkSubmissionsAllParams = {}) {
  const { data, isLoading } = useQuery({
    queryKey: ['homework_submissions_admin', search, page, limit, status],
    queryFn: () => homeworkActions.get_all_submissions({ 
      search, 
      page, 
      limit, 
      status: status || undefined 
    }),
  });

  return {
    submissions: (data?.data ?? []) as (HomeworkSubmission & { homework?: { name: string; lesson?: { name: string } } })[],
    meta: data?.meta,
    total_pages: data?.meta?.total_pages ?? 1,
    is_loading: isLoading,
  };
}
