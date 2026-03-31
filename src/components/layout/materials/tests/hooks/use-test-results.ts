import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslations } from 'next-intl';

import { testAttemptActions } from '../actions/test-attempt-actions';
import { ReviewAnswerPayload } from '../schemas/test-attempt-schema';

interface UseTestResultsProps {
  test_id: string;
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Hook for admin to view and manage test results
 * @param props - test_id, pagination, and status filter
 * @returns attempts list, stats, and review actions
 */
export function useTestResults({ test_id, page = 1, limit = 15, status }: UseTestResultsProps) {
  const query_client = useQueryClient();
  const t = useTranslations('Materials.tests.results');

  // Fetch attempts list
  const { data: attempts_data, isLoading: is_loading_attempts } = useQuery({
    queryKey: ['test-attempts', test_id, page, limit, status],
    queryFn: () => testAttemptActions.get_attempts({ test_id, page, limit, status }),
    enabled: !!test_id,
  });

  // Fetch test stats
  const { data: stats, isLoading: is_loading_stats } = useQuery({
    queryKey: ['test-stats', test_id],
    queryFn: () => testAttemptActions.get_test_stats(test_id),
    enabled: !!test_id,
  });

  // Fetch individual attempt
  const [selected_attempt_id, set_selected_attempt_id] = useState<string | null>(null);

  const { data: selected_attempt, isLoading: is_loading_attempt } = useQuery({
    queryKey: ['test-attempt', selected_attempt_id],
    queryFn: () => testAttemptActions.get_attempt(selected_attempt_id!),
    enabled: !!selected_attempt_id,
  });

  // Review answer mutation
  const review_mutation = useMutation({
    mutationFn: ({
      attempt_id,
      answer_id,
      data,
    }: {
      attempt_id: string;
      answer_id: string;
      data: ReviewAnswerPayload;
    }) => testAttemptActions.review_answer(attempt_id, answer_id, data),
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: ['test-attempts', test_id] });
      query_client.invalidateQueries({ queryKey: ['test-attempt', selected_attempt_id] });
      query_client.invalidateQueries({ queryKey: ['test-stats', test_id] });
      notifications.show({
        title: t('review_success_title'),
        message: t('review_success'),
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: t('review_error_title'),
        message: t('review_error'),
        color: 'red',
      });
    },
  });

  return {
    // Data
    attempts: attempts_data?.data || [],
    meta: attempts_data?.meta,
    total_pages: attempts_data?.meta?.total_pages || 1,
    stats,
    selected_attempt,

    // Loading
    is_loading: is_loading_attempts || is_loading_stats,
    is_loading_attempt,
    is_reviewing: review_mutation.isPending,

    // Actions
    select_attempt: set_selected_attempt_id,
    review_answer: review_mutation.mutate,
  };
}
