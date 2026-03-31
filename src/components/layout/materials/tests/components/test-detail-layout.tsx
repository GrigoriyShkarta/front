'use client';

import { useState } from 'react';

import {
  Stack,
  Tabs,
  Group,
  Button,
  Title,
  Text,
  Box,
  Badge,
  LoadingOverlay,
} from '@mantine/core';
import {
  IoDocumentTextOutline,
  IoStatsChartOutline,
  IoPlayOutline,
  IoChevronBackOutline,
} from 'react-icons/io5';
import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/use-auth';
import { useTestEditor } from '../hooks/use-test-editor';
import TestEditorContainer from './editor/test-editor-container';
import { TestResultsLayout } from './results/test-results-layout';

interface Props {
  test_id: string;
}

/**
 * Main test detail page — shows tabs for Content and Results.
 * For students: shows a "Start test" button instead of editing.
 * For admin: shows editable content and results tab.
 */
export function TestDetailLayout({ test_id }: Props) {
  const t = useTranslations('Materials.tests');
  const common_t = useTranslations('Common');
  const router = useRouter();
  const { user } = useAuth();

  const is_student = user?.role === 'student';
  const is_admin = user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'teacher';

  const { test, is_loading_test } = useTestEditor({ id: test_id });
  const [active_tab, set_active_tab] = useState<string | null>('content');

  if (is_loading_test) {
    return <Box mih="60vh" pos="relative"><LoadingOverlay visible /></Box>;
  }

  // Student goes directly to test-taking
  if (is_student) {
    return (
      <Stack gap="xl" maw={800} mx="auto" py="xl">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IoChevronBackOutline size={18} />}
          onClick={() => router.push('/main/materials/tests')}
          className="w-fit"
        >
          {t('editor.back')}
        </Button>

        <Stack align="center" gap="lg" py="xl">
          <Box className="p-4 rounded-2xl bg-primary/10 text-primary">
            <IoDocumentTextOutline size={40} />
          </Box>
          <Title order={1} fw={800} className="text-center">
            {test?.name}
          </Title>
          {test?.description && (
            <Text c="dimmed" className="text-center max-w-md">
              {test.description}
            </Text>
          )}
          <Button
            component={Link}
            href={`/main/materials/tests/${test_id}/take`}
            size="lg"
            radius="xl"
            leftSection={<IoPlayOutline size={22} />}
            className="bg-primary hover:opacity-90 shadow-xl shadow-primary/20 mt-4 transition-all hover:-translate-y-0.5"
          >
            {t('take.start_button')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  // Admin view with tabs
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IoChevronBackOutline size={18} />}
          onClick={() => router.push('/main/materials/tests')}
        >
          {t('editor.back')}
        </Button>
        <Title order={3} fw={700} className="flex-1 text-center truncate">
          {test?.name}
        </Title>
        <Box w={100} />
      </Group>

      <Tabs value={active_tab} onChange={set_active_tab}>
        <Tabs.List className="border-b border-white/10">
          <Tabs.Tab
            value="content"
            leftSection={<IoDocumentTextOutline size={16} />}
          >
            {t('detail.tab_content')}
          </Tabs.Tab>
          <Tabs.Tab
            value="results"
            leftSection={<IoStatsChartOutline size={16} />}
          >
            <Group gap={6}>
              {t('detail.tab_results')}
            </Group>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="content" pt="lg">
          <TestEditorContainer id={test_id} is_read_only />
        </Tabs.Panel>

        <Tabs.Panel value="results" pt="lg">
          <TestResultsLayout test_id={test_id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
