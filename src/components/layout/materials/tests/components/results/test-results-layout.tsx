'use client';

import { useState, useMemo } from 'react';

import {
  Stack,
  Box,
  LoadingOverlay,
  Pagination,
  Group,
  Text,
  Select,
  Paper,
} from '@mantine/core';
import { useTranslations } from 'next-intl';

import { useTestResults } from '../../hooks/use-test-results';
import { useTestEditor } from '../../hooks/use-test-editor';
import { TestQuestion } from '../../schemas/test-schema';
import { TestResultsStats } from './test-results-stats';
import { TestResultsTable } from './test-results-table';
import { TestAttemptReviewDrawer } from './test-attempt-review-drawer';

interface Props {
  test_id?: string;
}

/**
 * Full results tab for a specific test OR global review dashboard.
 * Shows stats, attempts table, and review drawer.
 */
export function TestResultsLayout({ test_id }: Props) {
  const t = useTranslations('Materials.tests.results');
  const common_t = useTranslations('Common');

  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState('15');
  const [status_filter, set_status_filter] = useState<string | null>(test_id ? null : 'pending_review');
  const [drawer_opened, set_drawer_opened] = useState(false);

  // If we have a test_id, we fetch specifically for that test and its questions
  const { test } = useTestEditor({ id: test_id || '' });

  const {
    attempts,
    meta,
    total_pages,
    stats,
    selected_attempt,
    is_loading,
    is_loading_attempt,
    is_reviewing,
    select_attempt,
    review_answer,
  } = useTestResults({
    test_id: test_id || '',
    page,
    limit: parseInt(limit),
    status: status_filter || undefined,
  });

  const questions: TestQuestion[] = useMemo(() => {
    // Priority 1: Fixed test questions (specific test view)
    if (test?.content) {
      try {
        return typeof test.content === 'string' ? JSON.parse(test.content) : test.content;
      } catch {
        return [];
      }
    }
    // Priority 2: Questions from the attempt itself (global view)
    if (selected_attempt?.test?.content) {
      try {
        const content = selected_attempt.test.content;
        return typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return [];
      }
    }
    return [];
  }, [test?.content, selected_attempt?.test?.content]);

  const handle_view_attempt = (attempt_id: string) => {
    select_attempt(attempt_id);
    set_drawer_opened(true);
  };

  const status_options = [
    { value: 'completed', label: t('filter.completed') },
    { value: 'pending_review', label: t('filter.pending_review') },
    { value: 'reviewed', label: t('filter.reviewed') },
    { value: 'in_progress', label: t('filter.in_progress') },
  ];

  return (
    <Stack gap="xl">
      <Box pos="relative">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={40} />

        {/* Stats */}
        {stats && <TestResultsStats stats={stats} />}

        {/* Filters */}
        <Paper withBorder radius="md" mt="lg" className="bg-white/5 border-white/10 overflow-hidden">
          <Box className="p-4 border-b border-white/10 bg-white/2">
            <Group justify="space-between">
              <Text size="sm" fw={600}>
                {t('attempts_title')}
                {meta && (
                  <Text span c="dimmed" ml="xs">({meta.total_items})</Text>
                )}
              </Text>
              <Select
                data={status_options}
                value={status_filter}
                onChange={set_status_filter}
                placeholder={t('filter.all')}
                clearable
                size="xs"
                w={180}
                variant="filled"
              />
            </Group>
          </Box>

          {/* Table */}
          <TestResultsTable
            attempts={attempts}
            on_view={handle_view_attempt}
          />

          {/* Empty state */}
          {!is_loading && attempts.length === 0 && (
            <Box py={60} className="text-center">
              <Text c="dimmed">{t('no_attempts')}</Text>
            </Box>
          )}

          {/* Pagination */}
          {!is_loading && attempts.length > 0 && (
            <Box className="p-4 border-t border-white/10 bg-white/2">
              <Group justify="center">
                <Group gap="xs">
                  <Text size="sm" c="dimmed">{common_t('show')}</Text>
                  <Select
                    data={['15', '30', '50']}
                    value={limit}
                    onChange={(val) => set_limit(val || '15')}
                    size="xs"
                    w={70}
                  />
                  <Text size="sm" c="dimmed">{common_t('per_page')}</Text>
                </Group>
                <Pagination
                  total={total_pages}
                  value={page}
                  onChange={set_page}
                  size="sm"
                  withEdges
                />
              </Group>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Review drawer */}
      <TestAttemptReviewDrawer
        opened={drawer_opened}
        on_close={() => { set_drawer_opened(false); select_attempt(null); }}
        attempt={selected_attempt}
        questions={questions}
        on_review={review_answer}
        is_reviewing={is_reviewing}
        is_loading={is_loading_attempt}
      />
    </Stack>
  );
}
