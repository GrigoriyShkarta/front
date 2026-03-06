import { useTranslations } from 'next-intl';
import { 
  TextInput, 
  Stack, 
  Paper, 
  Title, 
  Text
} from '@mantine/core';
import { UseFormReturn } from 'react-hook-form';
import { PersonalizationFormData } from '@/schemas/personalization';

interface Props {
  form: UseFormReturn<PersonalizationFormData>;
}

export function PersonalizationDashboardSection({ form }: Props) {
  const t = useTranslations('Personalization');
  
  const {
    register,
  } = form;

  return (
    <Paper withBorder p="xl" radius="24px" className="bg-white/5 border-white/5">
      <Stack gap="xl">
        <Stack gap={4}>
          <Title order={3}>{t('dashboard_section.title')}</Title>
          <Text size="sm" c="dimmed">
            {t('dashboard_section.title_description')}
          </Text>
        </Stack>
        <Text size="sm">Налаштування дашборду тимчасово недоступні або перенесені.</Text>
      </Stack>
    </Paper>
  );
}
