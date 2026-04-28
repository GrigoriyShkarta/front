'use client';

import React from 'react';
import { Box, Group, Stack, Text, Slider, ActionIcon, Button, Paper } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoPlay, IoStop, IoAdd, IoRemove } from 'react-icons/io5';
import { use_metronome } from '../hooks/use-metronome';

/**
 * MetronomeControl component - a high-precision visual metronome
 * @returns {JSX.Element}
 */
export const MetronomeControl: React.FC = () => {
  const t = useTranslations('Widgets.metronome');
  const { 
    is_playing, 
    bpm, 
    set_bpm, 
    time_signature, 
    set_time_signature, 
    current_beat, 
    toggle_metronome 
  } = use_metronome();

  return (
    <Stack gap="xl" align="center" className="w-full max-w-md">
      <Paper withBorder radius="2xl" p="xl" className="w-full bg-white dark:bg-zinc-900 shadow-xl border-zinc-100 dark:border-zinc-800">
        <Stack gap="xl" align="center">
          {/* Visual Beat Indicator */}
          <Group gap="sm" justify="center" className="w-full h-12">
            {Array.from({ length: time_signature }).map((_, i) => (
              <Box
                key={i}
                className={`
                  w-4 h-4 rounded-full transition-all duration-75
                  ${i === current_beat && is_playing
                    ? 'bg-secondary scale-125 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.5)]'
                    : 'bg-zinc-100 dark:bg-zinc-800'
                  }
                `}
              />
            ))}
          </Group>

          {/* BPM Display */}
          <Stack gap={0} align="center">
            <Text className="text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white">
              {bpm}
            </Text>
            <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-widest">
              {t('bpm')}
            </Text>
          </Stack>

          {/* BPM Controls */}
          <Group gap="xl" className="w-full px-4">
            <ActionIcon 
              variant="light" 
              size="xl" 
              radius="md" 
              onClick={() => set_bpm(Math.max(40, bpm - 1))}
            >
              <IoRemove size={24} />
            </ActionIcon>
            
            <Slider
              className="flex-1"
              min={40}
              max={240}
              value={bpm}
              onChange={set_bpm}
              label={null}
              size="lg"
              color="secondary"
              radius="xl"
            />

            <ActionIcon 
              variant="light" 
              size="xl" 
              radius="md" 
              onClick={() => set_bpm(Math.min(240, bpm + 1))}
            >
              <IoAdd size={24} />
            </ActionIcon>
          </Group>

          {/* Play/Stop Button */}
          <Button
            size="xl"
            radius="xl"
            fullWidth
            onClick={toggle_metronome}
            color="secondary"
            variant={is_playing ? 'light' : 'filled'}
            leftSection={is_playing ? <IoStop size={24} /> : <IoPlay size={24} />}
            className="h-16 shadow-lg active:scale-95 transition-transform"
          >
            <Text size="lg" fw={700}>
              {is_playing ? t('stop') : t('start')}
            </Text>
          </Button>

          {/* Settings */}
          <Stack gap={8} align="center" className="w-full pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Text size="xs" c="dimmed" fw={600} className="uppercase tracking-wider">{t('time_signature')}</Text>
            <Group gap="xs" justify="center">
              {[2, 3, 4, 6].map(val => (
                <Button
                  key={val}
                  variant={time_signature === val ? 'filled' : 'light'}
                  color="secondary"
                  size="compact-sm"
                  radius="md"
                  onClick={() => set_time_signature(val)}
                  className="min-w-[48px]"
                >
                  {val}/4
                </Button>
              ))}
            </Group>
          </Stack>
        </Stack>
      </Paper>

      <Text size="xs" c="dimmed" className="text-center italic px-8">
        {t('subtitle')}
      </Text>
    </Stack>
  );
};
