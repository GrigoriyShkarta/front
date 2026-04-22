'use client';

import { PageContainer } from '@/components/common/page-container';
import { PersonalizationForm } from './components/personalization-form';
import { Box, Title, Text, Group, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { UpgradePlanButton } from '@/components/common/upgrade-plan-button';
import { usePersonalizationForm } from './hooks/use-personalization-form';
import { FaPaintbrush } from 'react-icons/fa6';

export default function PersonalizationLayout() {
  const t = useTranslations('Personalization');
  const { is_premium } = usePersonalizationForm();

  return (
    <PageContainer size="lg">
      <Box mb="xl">
        <Group justify="space-between" align="flex-start">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <FaPaintbrush size={28} />
            </Box>
            <Stack gap={0}>
              <Title order={2}>{t('title')}</Title>
              <Text color="dimmed" size="sm">
                {t('description')}
              </Text>
            </Stack>  
          </Group>
          
          {!is_premium && <UpgradePlanButton size="md" />}
        </Group>
      </Box>


      <PersonalizationForm />
    </PageContainer>
  );
}