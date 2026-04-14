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
  Slider
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
import { IoDiamondOutline } from 'react-icons/io5';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
  is_premium: boolean;
}

export function PersonalizationVisualSection({ form, is_premium }: Props) {
  const t = useTranslations('Personalization');
  const { control, watch, register } = form;
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
      <Stack gap="lg">
        <Group justify="space-between">
          <Box>
            <Title order={4} mb={4} className="text-secondary">
              {t('visual_style_title')}
            </Title>
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

        <Controller
          name="primary_color"
          control={control}
          render={({ field }) => (
            <ColorSelect
              label={t('primary_color_label')}
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

        <Controller
          name="is_white_sidebar_color"
          control={control}
          render={({ field }) => (
            <Switch
              label={<Text size="sm" className="leading-none">{t('sidebar_text_color_label')}</Text>}
              onLabel={t('sidebar_color_white')}
              offLabel={t('sidebar_color_black')}
              styles={{ 
                body: { alignItems: 'center' },
                label: { paddingTop: 0 }
              }}
              checked={field.value}
              onChange={field.onChange}
              size="lg"
              className="mt-4"
            />
          )}
        />

        <Box>
          <Text size="sm" fw={500} mb={8}>
            {t('sidebar_width_label') || 'Sidebar Width'} ({watch('sidebar_width')}px)
          </Text>
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
                  markLabel: { fontSize: '10px' },
                  bar: { backgroundColor: watch('accent_color') },
                  thumb: { 
                    borderColor: watch('accent_color'),
                    backgroundColor: 'var(--mantine-color-white)' 
                  }
                }}
              />
            )}
          />
        </Box>

        <Controller
          name="secondary_color"
          control={control}
          render={({ field }) => (
            <ColorSelect
              label={t('secondary_color_label') || 'Secondary Color'}
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

        <Controller
          name="bg_color"
          control={control}
          render={({ field }) => (
            <ColorSelect
              label={t('bg_color_label') || 'Background Color'}
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
                body: { alignItems: 'center' },
                label: { paddingTop: 0 }
              }}
              checked={!!field.value}
              onChange={(event) => field.onChange(event.currentTarget.checked)}
              size="lg"
              className="mt-4"
            />
          )}
        />

        <Collapse in={!!watched_select_mode}>
          <Box pt="md">
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
    </Paper>
  );
}
