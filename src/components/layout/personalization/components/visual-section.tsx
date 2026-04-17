'use client';

import { useTranslations } from 'next-intl';
import { 
  Stack, 
  Paper, 
  Title, 
  Text,
  Box,
  Badge,
  Group,
  Switch,
  Collapse,
  Divider
} from '@mantine/core';
import { ColorSelect } from './color-select';
import { 
  PRIMARY_COLORS_CATEGORIZED, 
  PRIMARY_GRADIENTS,
  BACKGROUND_LIGHT, 
  BACKGROUND_DARK, 
  SECONDARY_COLORS,
  BACKGROUND_LIGHT_GRADIENTS,
  BACKGROUND_DARK_GRADIENTS,
  ACCENT_COLORS,
  ACCENT_GRADIENTS
} from '@/lib/constants';
import { Controller, UseFormReturn, useWatch } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';
import { IoDiamondOutline, IoColorFilterOutline, IoInvertModeOutline } from 'react-icons/io5';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
  is_premium: boolean;
}

export function PersonalizationVisualSection({ form, is_premium }: Props) {
  const t = useTranslations('Personalization');
  const { control } = form;
  const watched_select_mode = useWatch({
    control,
    name: 'select_mode'
  });

  // Show all options to everyone to encourage upgrades
  const primary_options = [...PRIMARY_COLORS_CATEGORIZED, ...PRIMARY_GRADIENTS];
  const secondary_options = SECONDARY_COLORS;
  const bg_light_options = [...BACKGROUND_LIGHT, ...BACKGROUND_LIGHT_GRADIENTS];
  const bg_dark_options = [...BACKGROUND_DARK, ...BACKGROUND_DARK_GRADIENTS];
  const accent_options = [...ACCENT_COLORS, ...ACCENT_GRADIENTS];

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
        <Group justify="space-between">
          <Box>
            <Group gap="xs" mb={4}>
              <Title order={4}>
                {t('visual_style_title')}
              </Title>
              {!is_premium && <IoDiamondOutline size={14} style={{ color: 'var(--space-primary)' }} />}
            </Group>
            <Text size="sm" color="dimmed">
              {t('visual_style_description')}
            </Text>
          </Box>
          {is_premium && (
            <Badge 
              variant="gradient" 
              gradient={{ from: 'var(--space-accent)', to: 'var(--space-accent-hover)' }} 
              leftSection={<IoDiamondOutline />}
              size="lg"
              className="shadow-sm"
            >
              {t('premium')}
            </Badge>
          )}
        </Group>

        <Stack gap="lg">
          <Box>
            <Group gap="xs" mb="xs">
              <IoColorFilterOutline size={18} className="text-secondary" />
              <Text fw={600} size="sm">{t('branding_colors') || 'Branding Colors'}</Text>
            </Group>
            
            <Stack gap="md" pl={4}>
              <Controller
                name="primary_color"
                control={control}
                render={({ field }) => (
              <ColorSelect
                label={t('primary_color_label')}
                description={t('primary_color_description') || 'Main color for sidebar and key elements'}
                options={primary_options}
                value={field.value}
                onChange={field.onChange}
                solid_label={t('solid_colors')}
                gradients_label={t('gradients')}
                is_premium={is_premium}
                type="primary"
              />
            )}
          />

          <Controller
            name="is_white_sidebar_color"
            control={control}
            render={({ field }) => (
              <Switch
                label={
                  <Box>
                    <Text size="sm" fw={500}>{t('sidebar_text_color_label')}</Text>
                    <Text size="xs" c="dimmed">{t('sidebar_text_color_description') || 'Contrast for better visibility on dark backgrounds'}</Text>
                  </Box>
                }
                onLabel={t('sidebar_color_white')}
                offLabel={t('sidebar_color_black')}
                styles={{ 
                  body: { alignItems: 'flex-start' },
                  label: { paddingTop: 0, paddingLeft: 12 }
                }}
                checked={field.value}
                onChange={field.onChange}
                size="lg"
                className="my-1"
              />
            )}
          />

          <Divider />

          <Controller
            name="accent_color"
            control={control}
            render={({ field }) => (
              <ColorSelect
                label={t('accent_color_label')}
                description={t('accent_color_description')}
                options={accent_options}
                value={field.value}
                onChange={field.onChange}
                solid_label={t('solid_colors')}
                gradients_label={t('gradients')}
                show_gradients={true}
                is_premium={is_premium}
                type="primary"
              />
            )}
          />

          <Divider />

          <Controller
            name="secondary_color"
            control={control}
            render={({ field }) => (
              <ColorSelect
                label={t('secondary_color_label') || 'Secondary Color'}
                description={t('secondary_color_description') || 'Used for borders, card backgrounds and subtle accents'}
                options={secondary_options}
                value={field.value}
                onChange={field.onChange}
                show_gradients={false}
                solid_label={t('solid_colors')}
                is_premium={is_premium}
                type="secondary"
              />
            )}
          />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Group gap="xs" mb="md">
              <IoInvertModeOutline size={18} className="text-secondary" />
              <Text fw={600} size="sm">{t('background_settings') || 'Background & Theme'}</Text>
            </Group>

            <Stack gap="md" pl={4}>
              <Controller
                name="bg_color"
                control={control}
                render={({ field }) => (
                  <ColorSelect
                    label={t('bg_color_label') || 'Light Mode Background'}
                    options={bg_light_options}
                    value={field.value}
                    onChange={field.onChange}
                    solid_label={t('solid_colors')}
                    gradients_label={t('gradients')}
                    show_gradients={true}
                    is_premium={is_premium}
                    type="background"
                  />
                )}
              />

              <Controller
                name="select_mode"
                control={control}
                render={({ field }) => (
                  <Switch
                    label={
                      <Stack gap={2}>
                        <Text size="sm" fw={500} className="leading-none">{t('dark_theme_label')}</Text>
                        <Text size="xs" c="dimmed">{t('dark_theme_description')}</Text>
                      </Stack>
                    }
                    styles={{ 
                      body: { alignItems: 'flex-start' },
                      label: { paddingTop: 0, paddingLeft: 12 }
                    }}
                    checked={!!field.value}
                    onChange={(event) => field.onChange(event.currentTarget.checked)}
                    size="lg"
                    className="mt-2"
                  />
                )}
              />

              <Collapse in={!!watched_select_mode}>
                <Box pt="sm">
                  <Controller
                    name="bg_color_dark"
                    control={control}
                    render={({ field }) => (
                      <ColorSelect
                        label={t('bg_color_dark_label')}
                        options={bg_dark_options}
                        value={field.value}
                        onChange={field.onChange}
                        solid_label={t('solid_colors')}
                        gradients_label={t('gradients')}
                        show_gradients={true}
                        is_premium={is_premium}
                        type="background"
                      />
                    )}
                  />
                </Box>
              </Collapse>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
