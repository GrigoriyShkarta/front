'use client';

import { useTranslations } from 'next-intl';
import { 
  Stack, 
  Paper, 
  Title, 
  Text,
  Box,
  Group,
  Switch,
  Slider,
} from '@mantine/core';
import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';
import { IoDiamondOutline, IoResizeOutline, IoTextOutline } from 'react-icons/io5';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
  is_premium: boolean;
}

export function PersonalizationLayoutSection({ form, is_premium }: Props) {
  const t = useTranslations('Personalization');
  const { control, watch } = form;

  return (
    <Paper 
      withBorder 
      p="xl" 
      radius="md" 
      className="backdrop-blur-md transition-all duration-500 shadow-sm"
      style={{ 
        borderColor: 'var(--space-secondary)',
        backgroundColor: 'var(--space-card-bg)' 
      }}
    >
      <Stack gap="xl">
        <Box>
          <Group gap="xs" mb={4}>
            <Title order={4}>
              {t('layout_settings_title') || 'Layout & Navigation'}
            </Title>
            {!is_premium && <IoDiamondOutline size={14} style={{ color: 'var(--space-primary)' }} />}
          </Group>
          <Text size="sm" color="dimmed">
            {t('layout_settings_description') || 'Customize how your sidebar and main interface feel.'}
          </Text>
        </Box>

        <Box>
          <Group gap="xs" mb={8}>
            <IoResizeOutline size={16} />
            <Text size="sm" fw={600}>
              {t('sidebar_width_label') || 'Sidebar Width'}
            </Text>
            <Text size="xs" c="dimmed">({watch('sidebar_width')}px)</Text>
          </Group>
          
          <Controller
            name="sidebar_width"
            control={control}
            render={({ field }) => (
              <Slider
                {...field}
                min={200}
                max={300}
                step={10}
                label={(val) => `${val}px`}
                marks={[
                  { value: 200, label: '200px' },
                  { value: 250, label: '250px' },
                  { value: 300, label: '300px' },
                ]}
                styles={{
                  markLabel: { fontSize: '10px', marginTop: 10 },
                  bar: { backgroundColor: 'var(--space-accent)' },
                  thumb: { 
                    borderColor: 'var(--space-accent)',
                    backgroundColor: 'var(--mantine-color-white)',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                  }
                }}
                className="mt-2 mb-8"
              />
            )}
          />
        </Box>


      </Stack>
    </Paper>
  );
}
