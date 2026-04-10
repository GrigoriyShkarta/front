'use client';

import { Title, Text, Stack, Breadcrumbs, Anchor } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { IoDocumentTextOutline } from "react-icons/io5";
import { Link } from '@/i18n/routing';
import { PageContainer } from '@/components/common/page-container';
import { HomeworkReviewsLayout } from '@/components/layout/materials/homework/components/homework-reviews-layout';
import { Box, Group } from '@mantine/core';

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
      <Stack gap="lg">
        <Breadcrumbs separator="→" mb="-xs">
          {breadcrumb_items}
        </Breadcrumbs>

        <Group justify="space-between" align="center" wrap="nowrap">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20 shrink-0">
              <IoDocumentTextOutline size={28} />
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

        <HomeworkReviewsLayout />
      </Stack>
    </PageContainer>
  );
}
