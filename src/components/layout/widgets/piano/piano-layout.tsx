'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Title, Text, Stack, Card, Container, Box, Group } from '@mantine/core';
import { PageContainer } from '@/components/common/page-container';
import { PianoKeyboard } from './components/piano-keyboard';
import { MdOutlinePiano } from "react-icons/md";

/**
 * PianoLayout component - provides a piano interface as a widget
 */
export const PianoLayout: React.FC = () => {
  const nt = useTranslations('Navigation');
  const wt = useTranslations('Widgets.piano');

  return (
    <PageContainer>
      <Container size="xl">
        <Stack gap="xl">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <MdOutlinePiano size={28} />
            </Box>
          <Stack gap={0}>
            <Title order={2} className="text-zinc-900 dark:text-white">
              {nt('piano')}
            </Title>
            <Text size="sm" c="dimmed">
              {wt('subtitle')}
            </Text>
          </Stack>
        </Group>

          <PianoKeyboard />
        </Stack>
      </Container>
    </PageContainer>
  );
};
