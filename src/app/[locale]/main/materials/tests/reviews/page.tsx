'use client';

import { Title, Text, Stack, Breadcrumbs, Anchor } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';

import { TestResultsLayout } from '@/components/layout/materials/tests/components/results/test-results-layout';
import { PageContainer } from '@/components/common/page-container';

/**
 * Global Test Reviews page for administrators.
 * Shows attempts across all tests that need review.
 */
export default function TestReviewsPage() {
  const t = useTranslations('Materials.tests.reviews');
  const tNav = useTranslations('Navigation');

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: t('title'), href: '/main/materials/tests/reviews' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <PageContainer>
      <Stack gap="md">
        <Breadcrumbs separator="→" mb="xs">
          {breadcrumb_items}
        </Breadcrumbs>
        <div>
          <Title order={2}>{t('title')}</Title>
          <Text c="dimmed">{t('description')}</Text>
        </div>

        <TestResultsLayout />
      </Stack>
    </PageContainer>
  );
}
