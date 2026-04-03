'use client';

import { Text, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { HomeworkSubmission } from '../../actions/homework-submission-actions';
import { useHomeworkReviews } from '../../hooks/use-homework-reviews';
import { HomeworkSubmissionsTable } from './homework-submissions-table';

interface Props {
  homework_id: string;
  status_filter: string | null;
  on_open_submission: (sub: HomeworkSubmission) => void;
}

/**
 * Lazily loads submissions for a homework when the row is expanded.
 * Renders the submissions table or empty state.
 * @param props - homework_id, status filter, and callback
 */
export function HomeworkReviewRowContent({ homework_id, status_filter, on_open_submission }: Props) {
  const t = useTranslations('Materials.homework.reviews');

  const { submissions, is_loading_submissions } = useHomeworkReviews({
    homework_id,
    status_filter,
  });

  if (is_loading_submissions) {
    return (
      <Box py="md" className="text-center">
        <Text size="sm" c="dimmed">{t('loading')}</Text>
      </Box>
    );
  }

  if (submissions.length === 0) {
    return (
      <Box py="md" className="text-center">
        <Text size="sm" c="dimmed">{t('no_submissions')}</Text>
      </Box>
    );
  }

  return (
    <HomeworkSubmissionsTable
      submissions={submissions}
      on_review={on_open_submission}
    />
  );
}
