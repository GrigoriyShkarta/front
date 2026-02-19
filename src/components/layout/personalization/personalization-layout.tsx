'use client';

import { PageContainer } from '@/components/common/page-container';
import { PersonalizationForm } from './components/personalization-form';
import { Box, Title, Text, Breadcrumbs, Anchor, Group, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { UpgradePlanButton } from '@/components/common/upgrade-plan-button';

export default function PersonalizationLayout() {
  const t = useTranslations('Personalization');
  const tNav = useTranslations('Navigation');

  const items = [
    { title: tNav('dashboard'), href: '/main' },
    { title: tNav('personalization'), href: '/main/personalization' },
  ].map((item, index) => (
    <Anchor component={Link} href={item.href} key={index} size="sm">
      {item.title}
    </Anchor>
  ));

  return (
    <PageContainer size="md">
      <Box mb="xl">
        <Breadcrumbs mb="xs" separator="→">{items}</Breadcrumbs>
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Title order={2}>{t('title')}</Title>
            <Text color="dimmed" size="sm">
              {t('description')}
            </Text>
          </Stack>
          <UpgradePlanButton size="md" />
        </Group>
      </Box>

      <PersonalizationForm />
    </PageContainer>
  );
}