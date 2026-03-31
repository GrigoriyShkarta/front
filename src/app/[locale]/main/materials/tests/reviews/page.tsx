'use client';

import { Title, Text, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { TestResultsLayout } from '@/components/layout/materials/tests/components/results/test-results-layout';
import { PageContainer } from '@/components/common/page-container';

/**
 * Global Test Reviews page for administrators.
 * Shows attempts across all tests that need review.
 */
export default function TestReviewsPage() {
  const t = useTranslations('Materials.tests.reviews');

  return (
    <PageContainer>
      <Stack gap="md">
        <div>
          <Title order={2}>{t('title')}</Title>
          <Text c="dimmed">{t('description')}</Text>
        </div>

        <TestResultsLayout />
      </Stack>
    </PageContainer>
  );
}
