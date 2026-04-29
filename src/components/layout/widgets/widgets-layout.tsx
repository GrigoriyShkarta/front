'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Title, Text, Stack, Container, SimpleGrid, Card, Box, Group } from '@mantine/core';
import { PageContainer } from '@/components/common/page-container';
import { IoAppsOutline, IoTimerOutline, IoHourglassOutline } from "react-icons/io5";
import { MdOutlinePiano } from "react-icons/md";

/**
 * WidgetsLayout component - hub for all available interactive widgets
 */
export const WidgetsLayout: React.FC = () => {
  const nt = useTranslations('Navigation');
  const wt = useTranslations('Widgets');

  const widgets = [
    {
      id: 'piano',
      label: nt('piano'),
      description: wt('piano.subtitle'),
      icon: MdOutlinePiano,
      href: '/main/widgets/piano',
      color: 'blue'
    },
    {
      id: 'metronome',
      label: nt('metronome'),
      description: wt('metronome.subtitle'),
      icon: IoTimerOutline,
      href: '/main/widgets/metronome',
      color: 'teal'
    },
    {
      id: 'timer',
      label: nt('timer'),
      description: wt('timer.subtitle'),
      icon: IoHourglassOutline,
      href: '/main/widgets/timer',
      color: 'orange'
    }
  ];

  return (
    <PageContainer>
      <Container size="xl">
        <Stack gap="xl">
          <Group align="center" gap="md">
            <Box className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shadow-sm border border-secondary/20 shrink-0">
              <IoAppsOutline size={28} />
            </Box>
            <Stack gap={0}>
              <Title order={2}>
                {nt('widgets')}
              </Title>
              <Text size="sm" c="dimmed">
                Interactive tools and utilities for music and education
              </Text>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {widgets.map((widget) => (
              <Card
                key={widget.id}
                component={Link}
                href={widget.href}
                withBorder
                padding="xl"
                radius="lg"
                className="hover:shadow-md transition-all active:scale-[0.98] bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 h-full group"
              >
                <Stack justify="space-between" className="h-full">
                  <Box className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                    <widget.icon size={32} />
                  </Box>
                  
                  <Stack gap={4}>
                    <Text fw={700} size="lg" className="text-zinc-900 dark:text-white">
                      {widget.label}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      {widget.description}
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </PageContainer>
  );
};
