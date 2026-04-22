'use client';

import { useState, useEffect } from 'react';

import { Stack, Box, LoadingOverlay, Pagination, Group, Text, Select, Paper, TextInput, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@mantine/hooks';
import { IoSearchOutline } from 'react-icons/io5';

import { Link, useRouter } from '@/i18n/routing';
import { useTestResults } from '../../hooks/use-test-results';
import { TestResultsStats } from './test-results-stats';
import { TestResultsTable } from './test-results-table';
import { IoMdCheckboxOutline } from 'react-icons/io';

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
  const [search, set_search] = useState('');
  const [debounced_search] = useDebouncedValue(search, 400);

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
    search: debounced_search,
  });

  // Reset to first page on status or search change
  useEffect(() => {
    set_page(1);
  }, [status_filter, limit, debounced_search]);

  const handle_view_attempt = (attempt_id: string) => {
    router.push(`/main/materials/tests/reviews/${attempt_id}`);
  };

  const status_options = [
    { value: 'completed', label: t('filter.completed') },
    { value: 'pending_review', label: t('filter.pending_review') },
    { value: 'reviewed', label: t('filter.reviewed') },
  ];

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group align="center" gap="md">
          <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
            <IoMdCheckboxOutline size={28} />
          </Box>
          <Stack gap={0}>
            <Title order={2} className="text-[24px] sm:text-[28px] font-bold tracking-tight">
              {t('title')}
            </Title>
            <Text c="dimmed" size="sm" className="hidden sm:block">
              {t('description')}
            </Text>
          </Stack>
        </Group>
      </Group>

      <Box pos="relative">
        <LoadingOverlay visible={is_loading} overlayProps={{ blur: 2 }} zIndex={40} />

        {/* Stats */}
        {test_id && stats && <TestResultsStats stats={stats} />}

        {/* Filters */}
        <Paper withBorder radius="md" mt="lg" className="bg-white/5 border-white/10 overflow-hidden">
          <Box className="p-4 border-b border-white/10 bg-white/2">
            <Group justify="space-between">
              <TextInput
                placeholder={common_t('search') + '...'}
                size="xs"
                w={200}
                leftSection={<IoSearchOutline size={14} />}
                value={search}
                onChange={(e) => set_search(e.currentTarget.value)}
                radius="md"
                variant="filled"
              />

              <Select
                data={status_options}
                value={status_filter}
                onChange={set_status_filter}
                placeholder={t('filter.all')}
                clearable
                size="xs"
                w={180}
                variant="filled"
                radius="md"
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
            <Box py={80} className="text-center">
              <Stack align="center" gap="md">
                <Text size="lg" fw={700} c="dimmed">{t('no_attempts')}</Text>
                <Text size="sm" c="dimmed">
                  {status_filter ? t('filter.no_results_for_filter') || 'No attempts for this status' : t('filter.no_attempts_yet') || 'No attempts recorded yet'}
                </Text>
              </Stack>
            </Box>
          )}

          {/* Footer with Pagination and Limit selector */}
          {!is_loading && attempts.length > 0 && (
            <Box className="p-4 border-t border-white/10 bg-white/2">
              <Group justify="center" gap="xl">
                <Group gap="xs">
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={1}>{common_t('show')}</Text>
                  <Select
                    data={['15', '30', '50']}
                    value={limit}
                    onChange={(val) => set_limit(val || '15')}
                    variant="filled"
                    size="xs"
                    w={70}
                    radius="md"
                  />
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={1}>{common_t('per_page')}</Text>
                </Group>
                
                <Pagination
                  total={total_pages}
                  value={page}
                  onChange={set_page}
                  size="sm"
                  radius="md"
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
