'use client';

import { Modal, Stack, Title, Text, Button, ThemeIcon, Group } from '@mantine/core';
import { IoDiamondOutline, IoRocketOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function UpgradeModal({ opened, onClose }: Props) {
  const t = useTranslations('Common.upgrade_modal');
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/main/billing');
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      centered 
      size={500}
      radius="xl" 
      padding="xl"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack align="center" gap="lg" py="md">
        <ThemeIcon 
          size={80} 
          radius="xl" 
          style={{
            background: 'var(--space-primary-bg)',
            color: 'var(--space-sidebar-text)'
          }}
        >
          <IoDiamondOutline size={40} />
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Title order={3} className="text-center">{t('title')}</Title>
          <Text color="dimmed" size="sm" className="text-center px-4">
            {t('description')}
          </Text>
        </Stack>

        <Group grow mt="md" className="w-full">
            <Button variant="subtle" color="gray" onClick={onClose} flex={1} radius="md">
                {t('button_cancel')}
            </Button>
            <Button 
                onClick={handleUpgrade} 
                flex={2} 
                radius="md" 
                style={{
                    background: 'var(--space-primary-bg)',
                    color: 'var(--space-sidebar-text)'
                }}
                className="shadow-lg hover:brightness-110 transition-all"
                leftSection={<IoRocketOutline size={18} />}
            >
                {t('button')}
            </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
