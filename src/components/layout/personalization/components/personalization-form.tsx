'use client';

import { useTranslations } from 'next-intl';
import { usePersonalizationForm } from '../hooks/use-personalization-form';
import { 
  Stack, 
  Button, 
} from '@mantine/core';

import { PersonalizationDetailsSection } from './details-section';
import { PersonalizationVisualSection } from './visual-section';
import { PersonalizationLanguagesSection } from './languages-section';

import { updatePersonalization } from '../actions/personalization.actions';
import { notifications } from '@mantine/notifications';
import { IoSaveOutline } from 'react-icons/io5';
import { PersonalizationFontSection } from './font-section';
import { PersonalizationFormData } from '@/schemas/personalization';
import { useDisclosure } from '@mantine/hooks';
import { UpgradeModal } from '@/components/common/upgrade-modal';

/**
 * PersonalizationForm - A form to customize space settings.
 * Refactored to handle Premium features and HEX-based color selection.
 * @returns {JSX.Element} The rendered form
 */
export function PersonalizationForm() {
  const t = useTranslations('Personalization');
  const { form, space, is_premium, has_premium_selected } = usePersonalizationForm();
  const [upgrade_opened, { open: open_upgrade, close: close_upgrade }] = useDisclosure(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: PersonalizationFormData) => {
    console.log('data', data);
    // If user is not premium but selected premium features, show modal
    if (!is_premium && has_premium_selected) {
      open_upgrade();
      return;
    }

    try {
      // Process icon file if changed (already handled by FormData in actions)
      await updatePersonalization(data);
      
      notifications.show({
        title: t('success'),
        message: t('save_success'),
        color: 'teal',
      });
    } catch (error: any) {
      console.error('Failed to update personalization:', error);
      notifications.show({
        title: t('error'),
        message: error.message || t('save_error'),
        color: 'red',
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <PersonalizationDetailsSection 
            form={form} 
            initial_icon={space?.icon}
            is_premium={is_premium} 
          />

          <PersonalizationVisualSection 
            form={form} 
            is_premium={is_premium} 
          />

          <PersonalizationFontSection 
            form={form} 
            is_premium={is_premium}
          />

          <PersonalizationLanguagesSection 
            form={form} 
          />

          <Button 
            type="submit" 
            size="lg" 
            loading={isSubmitting}
            disabled={isSubmitting || !form.formState.isValid}
            leftSection={<IoSaveOutline size={20} />}
            className="shadow-lg h-14 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'var(--space-primary-bg)',
              color: 'var(--space-sidebar-text)'
            }}
          >
            {t('save_button')}
          </Button>
        </Stack>
      </form>

      <UpgradeModal 
        opened={upgrade_opened} 
        onClose={close_upgrade} 
      />
    </>
  );
}
