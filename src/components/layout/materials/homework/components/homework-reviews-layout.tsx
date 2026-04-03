'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { 
  Paper, 
  Stack, 
  Group, 
  Text, 
  TextInput, 
  Select, 
  ThemeIcon, 
  Pagination, 
  Center,
  LoadingOverlay,
  Box
} from '@mantine/core';
import { IoSearchOutline, IoFilterOutline, IoSchoolOutline, IoReaderOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useDebouncedValue } from '@mantine/hooks';

import { useHomeworksAll } from '../hooks/use-homeworks-all';
import { HomeworkResultsTable } from './reviews/homework-results-table';
import { PageContainer } from '@/components/common/page-container';

/**
 * Main dashboard layout for administrative homework review.
 * Displays a flat, filterable list of all student submissions across all homeworks.
 * Mimics the premium Test Results dashboard experience.
 */
export function HomeworkReviewsLayout() {
  const t = useTranslations('Materials.homework.reviews');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const [search, set_search] = useState('');
  const [debounced_search] = useDebouncedValue(search, 400);
  const [status, set_status] = useState<string | null>('pending');
  const [page, set_page] = useState(1);
  const [limit, set_limit] = useState('15');

  const { homeworks, total_pages, is_loading } = useHomeworksAll({
    search: debounced_search,
    status,
    page: page,
    limit: parseInt(limit)
  });

  // Reset to first page on filter change
  React.useEffect(() => {
    set_page(1);
  }, [debounced_search, status, limit]);

  // Flatten submissions from all homeworks and inject homework/lesson context
  const all_submissions = React.useMemo(() => {
    return homeworks.flatMap(hw => 
      (hw.submissions || []).map(sub => ({
        ...sub,
        homework: {
          id: hw.id,
          name: hw.name,
          lesson: hw.lesson
        }
      }))
    );
  }, [homeworks]);

  const handle_view_submission = (id: string) => {
    router.push(`/main/materials/homeworks/reviews/${id}`);
  };

  return (
    <PageContainer>
      <Stack gap="xl">
        <Box pos="relative">
          <LoadingOverlay 
            visible={is_loading} 
            overlayProps={{ blur: 1, radius: 'md' }} 
            loaderProps={{ color: 'primary', type: 'bars' }}
            zIndex={10}
          />

          <Paper withBorder radius="md" mt="lg" className="bg-white/5 border-white/10 overflow-hidden relative">
            {/* Filters Toolbar */}
            <Box className="p-4 border-b border-white/10 bg-white/2">
              <Group justify="space-between">
                <TextInput
                  placeholder={common_t('search') + '...'}
                  leftSection={<IoSearchOutline size={14} />}
                  value={search}
                  onChange={(e) => set_search(e.currentTarget.value)}
                  size="xs"
                  w={250}
                  radius="md"
                  variant="filled"
                />
                
                <Select
                  placeholder={t('filter.all')}
                  leftSection={<IoFilterOutline size={14} className="text-zinc-500" />}
                  data={[
                    { value: 'pending', label: t('filter.pending') },
                    { value: 'reviewed', label: t('filter.reviewed') },
                  ]}
                  value={status}
                  onChange={set_status}
                  radius="md"
                  size="xs"
                  w={180}
                  variant="filled"
                  clearable
                />
              </Group>
            </Box>

            {/* Table Section */}
            {all_submissions.length > 0 ? (
              <HomeworkResultsTable 
                  submissions={all_submissions as any} 
                  on_view={handle_view_submission} 
              />
            ) : (
              <Box py={80} className="text-center">
                <Stack align="center" gap="md">
                  <Text size="lg" fw={700} c="dimmed">{t('no_submissions') || 'No submissions found'}</Text>
                  <Text size="sm" c="dimmed">
                    {search || status ? common_t('no_results_found') || 'No results for this filter' : t('empty_description')}
                  </Text>
                </Stack>
              </Box>
            )}

            {/* Footer with Pagination and Limit selector */}
            {!is_loading && all_submissions.length > 0 && (
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
    </PageContainer>
  );
}
