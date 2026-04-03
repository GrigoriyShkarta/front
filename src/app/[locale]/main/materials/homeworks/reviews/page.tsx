'use client';

import { Title, Text, Stack, Breadcrumbs, Anchor } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { PageContainer } from '@/components/common/page-container';
import { HomeworkReviewsLayout } from '@/components/layout/materials/homework/components/homework-reviews-layout';

/**
 * Global Homework Reviews page for teachers and admins.
 * Shows all homework assignments with student submissions to review.
 */
export default function HomeworkReviewsPage() {
  const t = useTranslations('Materials.homework.reviews');
  const tNav = useTranslations('Navigation');

  const breadcrumb_items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: t('title'), href: '/main/materials/homeworks/reviews' },
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

        <HomeworkReviewsLayout />
      </Stack>
    </PageContainer>
  );
}
