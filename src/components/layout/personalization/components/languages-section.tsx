'use client';

import { useTranslations } from 'next-intl';
import { 
  Stack, 
  MultiSelect, 
  Paper, 
  Title, 
  Text,
  Box
} from '@mantine/core';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Controller, UseFormReturn } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
}

export function PersonalizationLanguagesSection({ form }: Props) {
  const t = useTranslations('Personalization');
  const common_t = useTranslations('Common');
  const { control, formState: { errors } } = form;

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
            {t('languages_title')}
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            {t('languages_description')}
          </Text>
        </Box>

        <Controller
          name="languages"
          control={control}
          render={({ field }) => (
            <MultiSelect
              label={t('languages_label')}
              placeholder={t('select_languages_placeholder')}
              data={SUPPORTED_LANGUAGES.map(l => ({ value: l.id, label: l.label }))}
              withAsterisk
              value={field.value}
              onChange={field.onChange}
              error={errors.languages?.message ? common_t(errors.languages.message as any) : undefined}
              searchable
              variant="filled"
              styles={{
                required: { color: 'red' }
              }}
            />
          )}
        />
      </Stack>
    </Paper>
  );
}
