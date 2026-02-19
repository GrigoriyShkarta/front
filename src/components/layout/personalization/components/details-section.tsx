'use client';

import { useState, memo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  TextInput, 
  Stack, 
  Button, 
  Group, 
  Paper, 
  Title, 
  Text,
  Box,
  FileButton,
  Avatar,
  Switch,
  rem
} from '@mantine/core';
import { IoCloudUploadOutline, IoTrashOutline, IoDiamondOutline } from 'react-icons/io5';
import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
  initial_icon?: string | null;
  is_premium: boolean;
}

export function PersonalizationDetailsSection({ form, initial_icon, is_premium }: Props) {
  const t = useTranslations('Personalization');
  const common_t = useTranslations('Common');
  const [icon_preview, set_icon_preview] = useState<string | null>(initial_icon || null);

  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = form;

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
        <Box>
          <Title order={4} mb={4} className="text-gradient-primary">
            {t('space_details_title')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {t('space_details_description')}
          </Text>
        </Box>

        <TextInput
          label={t('title_space_label')}
          placeholder={t('enter_space_name')}
          withAsterisk
          {...register('title_space')}
          error={errors.title_space?.message && common_t(errors.title_space.message as any)}
          variant="filled"
          styles={{
            required: { color: 'red' },
            error: { fontSize: rem(12), marginTop: rem(4) }
          }}
        />

        <Box>
          <Text size="sm" fw={500} mb={8}>{t('icon_label')}</Text>
          <Group>
            <Avatar src={icon_preview} size="xl" radius="md" className="shadow-inner border border-gray-200 dark:border-gray-800">
              {watch('title_space')?.[0]?.toUpperCase() || 'L'}
            </Avatar>
            <Stack gap={5}>
              <FileButton onChange={(file) => {
                if (file) {
                  set_icon_preview(URL.createObjectURL(file));
                  setValue('icon', file);
                }
              }} accept="image/png,image/jpeg">
                {(props) => (
                  <Button 
                    {...props} 
                    variant="light" 
                    leftSection={<IoCloudUploadOutline size={16} />} 
                    rightSection={!is_premium && <IoDiamondOutline size={10} style={{ color: 'var(--space-primary)' }} />}
                    size="sm"
                  >
                    {t('upload_logo')}
                  </Button>
                )}
              </FileButton>
              {icon_preview && (
                <Button 
                  variant="subtle" 
                  color="red" 
                  size="xs" 
                  onClick={() => {
                    set_icon_preview(null);
                    setValue('icon', null);
                  }}
                  leftSection={<IoTrashOutline size={14} />}
                >
                  {t('remove_logo')}
                </Button>
              )}
            </Stack>
          </Group>
        </Box>

        <Controller
          name="is_show_sidebar_icon"
          control={control}
          render={({ field }) => (
            <Switch
              label={
                <Group gap={8} align="center">
                  <Text size="sm" className="leading-none">{t('is_show_sidebar_icon_label')}</Text>
                  {!is_premium && <IoDiamondOutline size={14} style={{ color: 'var(--space-primary)' }} />}
                </Group>
              }
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
      </Stack>
    </Paper>
  );
}
