'use client';

import { useTranslations } from 'next-intl';
import { 
  Stack, 
  Paper, 
  Title, 
  Text,
  Box
} from '@mantine/core';
import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';
import { FontSelect } from './font-select';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
  is_premium: boolean;
}

export function PersonalizationFontSection({ form, is_premium }: Props) {
  const t = useTranslations('Personalization');
  const { control } = form;

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
            {t('font_title')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {t('font_description')}
          </Text>
        </Box>

        <Controller
          name="font_family"
          control={control}
          render={({ field }) => (
            <FontSelect
              value={field.value}
              onChange={field.onChange}
              is_premium_user={is_premium}
            />
          )}
        />
      </Stack>
    </Paper>
  );
}
