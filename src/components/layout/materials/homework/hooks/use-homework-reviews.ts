'use client';

import { useQuery } from '@tanstack/react-query';

import { homeworkActions } from '../actions/homework-actions';
import { HomeworkSubmission } from '../actions/homework-submission-actions';

interface UseHomeworkReviewsParams {
  homework_id?: string;
  status_filter?: string | null;
}

/**
 * Hook for lazily fetching submissions for a specific homework.
 * Only fetches when homework_id is provided (row is expanded).
 * Client-side filters by status.
 *
 * @param params - homework_id and optional status filter
 * @returns Filtered submissions list and loading state
 */
export function useHomeworkReviews({ homework_id, status_filter }: UseHomeworkReviewsParams = {}) {
  const { data: submissions, isLoading: is_loading_submissions } = useQuery<HomeworkSubmission[]>({
    queryKey: ['homework_submissions', homework_id],
    queryFn: () => homeworkActions.get_submissions(homework_id!),
    enabled: !!homework_id,
  });

  const filtered_submissions: HomeworkSubmission[] = (() => {
    if (!submissions) return [];
    if (!status_filter) return submissions;
    return submissions.filter((s) => s.status === status_filter);
  })();

  return {
    submissions: filtered_submissions,
    all_submissions: submissions ?? [],
    is_loading_submissions,
  };
}
