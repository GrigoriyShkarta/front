'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Title, Text, Stack, Container, Box, Group } from '@mantine/core';
import { PageContainer } from '@/components/common/page-container';
import { IoTimerOutline } from "react-icons/io5";
import { MetronomeControl } from './components/metronome-control';

/**
 * MetronomeLayout component - provides a metronome interface as a widget
 */
export const MetronomeLayout: React.FC = () => {
  const nt = useTranslations('Navigation');
  const wt = useTranslations('Widgets.metronome');

  return (
    <PageContainer>
      <Container size="xl">
        <Stack gap="xl">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <IoTimerOutline size={28} />
            </Box>
            <Stack gap={0}>
              <Title order={2}>
                {nt('metronome')}
              </Title>
              <Text size="sm" c="dimmed">
                {wt('subtitle')}
              </Text>
            </Stack>
          </Group>

          <Center className="py-12">
            <MetronomeControl />
          </Center>
        </Stack>
      </Container>
    </PageContainer>
  );
};

// Simple Center wrapper since Mantine Center is already available but sometimes imports are tricky
const Center: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`flex justify-center items-center ${className}`}>
    {children}
  </div>
);
