'use client';

import React from 'react';
import { Container, Stack, Title, Text, Group, ActionIcon, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { IoArrowBackOutline, IoHourglassOutline } from 'react-icons/io5';
import { PageContainer } from '@/components/common/page-container';
import { TimerWidget } from '@/components/layout/widgets/timer/timer-layout';

export default function TimerPage() {
  const t = useTranslations('Widgets.Timer');
  const common_t = useTranslations('Common');
  const router = useRouter();

  return (
    <PageContainer>
      <Container size="sm" py="xl">
        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                size="lg" 
                radius="md" 
                onClick={() => router.back()}
              >
                <IoArrowBackOutline size={22} />
              </ActionIcon>
              <Box className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <IoHourglassOutline size={24} />
              </Box>
              <Stack gap={0}>
                <Title order={3}>{t('title')}</Title>
                <Text size="xs" c="dimmed">{t('subtitle')}</Text>
              </Stack>
            </Group>
          </Group>

          <Box 
            p="md" 
            style={{ 
              borderRadius: 32,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}
          >
            <TimerWidget />
          </Box>
        </Stack>
      </Container>
    </PageContainer>
  );
}
