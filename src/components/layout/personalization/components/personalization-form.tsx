'use client';

import { useTranslations } from 'next-intl';
import { usePersonalizationForm } from '../hooks/use-personalization-form';
import { 
  Stack, 
  Button, 
  Tabs,
  Box,
  rem
} from '@mantine/core';

import { PersonalizationDetailsSection } from './details-section';
import { PersonalizationVisualSection } from './visual-section';
import { PersonalizationLayoutSection } from './layout-section';
import { PersonalizationLanguagesSection } from './languages-section';

import { updatePersonalization } from '../actions/personalization.actions';
import { notifications } from '@mantine/notifications';
import { IoSaveOutline, IoColorPaletteOutline, IoSettingsOutline, IoDocumentTextOutline, IoLanguageOutline, IoTextOutline } from 'react-icons/io5';
import { PersonalizationFontSection } from './font-section';
import { PersonalizationFormData } from '@/schemas/personalization';
import { useDisclosure } from '@mantine/hooks';
import { UpgradeModal } from '@/components/common/upgrade-modal';
import { useAuthContext } from '@/context/auth-context';

export function PersonalizationForm() {
  const t = useTranslations('Personalization');
  const { form, space, is_premium, has_premium_selected } = usePersonalizationForm();
  const [upgrade_opened, { open: open_upgrade, close: close_upgrade }] = useDisclosure(false);
  const { refresh_user } = useAuthContext();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: PersonalizationFormData) => {
    if (!is_premium && has_premium_selected) {
      open_upgrade();
      return;
    }

    try {
      await updatePersonalization(data);
      await refresh_user();
      
      notifications.show({
        title: t('success'),
        message: t('save_success'),
        color: 'teal',
      });
    } catch (error: any) {
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

            <Tabs defaultValue="general" variant="pills" radius="xl" styles={{
              root: { width: '100%' },
              list: { marginBottom: rem(24), padding: 4, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 100 },
              tab: { transition: 'all 0.3s' }
            }}>
              <Tabs.List>
                <Tabs.Tab value="general" leftSection={<IoSettingsOutline size={16} />}>
                  {t('tab_general') || 'General'}
                </Tabs.Tab>
                <Tabs.Tab value="branding" leftSection={<IoColorPaletteOutline size={16} />}>
                  {t('tab_branding') || 'Branding'}
                </Tabs.Tab>
                <Tabs.Tab value="layout" leftSection={<IoDocumentTextOutline size={16} />}>
                  {t('tab_layout') || 'Layout'}
                </Tabs.Tab>
                <Tabs.Tab value="typography" leftSection={<IoTextOutline size={16} />}>
                  {t('tab_typography') || 'Typography'}
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="general">
                <Stack gap="xl">
                  <PersonalizationDetailsSection 
                    form={form} 
                    initial_icon={space?.icon}
                    is_premium={is_premium} 
                  />
                  <PersonalizationLanguagesSection form={form} />
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="branding">
                <PersonalizationVisualSection 
                  form={form} 
                  is_premium={is_premium} 
                />
              </Tabs.Panel>

              <Tabs.Panel value="layout">
                <PersonalizationLayoutSection 
                  form={form} 
                  is_premium={is_premium} 
                />
              </Tabs.Panel>

              <Tabs.Panel value="typography">
                <PersonalizationFontSection 
                  form={form} 
                  is_premium={is_premium}
                />
              </Tabs.Panel>
            </Tabs>
            
            <Box mt="xl">
              <Button 
                type="submit" 
                size="lg" 
                loading={isSubmitting}
                disabled={isSubmitting || !form.formState.isValid}
                leftSection={<IoSaveOutline size={20} />}
                fullWidth
                className="shadow-lg h-14 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'var(--space-accent-bg)',
                  color: 'var(--space-accent-text, #ffffff)'
                }}
              >
                {t('save_button')}
              </Button>
            </Box>
      </form>

      <UpgradeModal 
        opened={upgrade_opened} 
        onClose={close_upgrade} 
      />
    </>
  );
}
