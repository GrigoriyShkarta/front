'use client';

import { useState, useMemo } from 'react';

import { Stack, Box, LoadingOverlay, Pagination, Group, Text, Select, Paper } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/routing';
import { useTestResults } from '../../hooks/use-test-results';
import { useTestEditor } from '../../hooks/use-test-editor';
import { TestResultsStats } from './test-results-stats';
import { TestResultsTable } from './test-results-table';

interface Props {
  test_id?: string;
}

/**
 * Full results tab for a specific test OR global review dashboard.
 * Shows stats and attempts table. Row click navigates to a full review page.
 */
export function TestResultsLayout({ test_id }: Props) {
  const t = useTranslations('Materials.tests.results');
  const common_t = useTranslations('Common');
  const router = useRouter();

  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState('15');
  const [status_filter, set_status_filter] = useState<string | null>(test_id ? null : 'pending_review');

  // If we have a test_id, we fetch stats for that test
  const { test } = useTestEditor({ id: test_id || '' });

  const {
    attempts,
    meta,
    total_pages,
    stats,
    is_loading,
  } = useTestResults({
    test_id: test_id || '',
    page,
    limit: parseInt(limit),
    status: status_filter || undefined,
  });

  const handle_view_attempt = (attempt_id: string) => {
    router.push(`/main/materials/tests/reviews/${attempt_id}`);
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
        {test_id && stats && <TestResultsStats stats={stats} />}

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
            show_test_name={!test_id}
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
    </Stack>
  );
}
