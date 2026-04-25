'use client';

import { useState, useEffect } from 'react';
import { Modal, Text, Button, Stack, Group, ThemeIcon } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoCloudOfflineOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/i18n/routing';
import { ROLES } from '@/types/auth.types';

/**
 * StorageLimitHandler - Global component to handle 413 (Storage Limit Exceeded) errors.
 * Listens to a custom event 'storage-limit-exceeded' dispatched from the API interceptor.
 */
export function StorageLimitHandler() {
  const [opened, setOpened] = useState(false);
  const { user } = useAuth();
  const t = useTranslations('StorageLimit');
  const router = useRouter();

  useEffect(() => {
    const handleStorageLimit = () => {
      setOpened(true);
    };

    window.addEventListener('storage-limit-exceeded', handleStorageLimit);
    return () => {
      window.removeEventListener('storage-limit-exceeded', handleStorageLimit);
    };
  }, []);

  if (!user) return null;

  const is_super_admin = user.role === ROLES.SUPER_ADMIN;
  const is_student = user.role === ROLES.STUDENT;
  const is_premium = user.is_premium;

  const handleAction = () => {
    setOpened(false);
    if (is_super_admin) {
      if (is_premium) {
        router.push('/main/storage');
      } else {
        router.push('/main/billing');
      }
    }
  };

  // Determine description and action based on user role and status
  let description = t('student_desc');
  let button_text = t('close_button');
  let show_action_button = is_super_admin;

  if (is_super_admin) {
    if (is_premium) {
      description = t('super_admin_premium_desc');
      button_text = t('storage_button');
    } else {
      description = t('super_admin_free_desc');
      button_text = t('upgrade_button');
    }
  } else if (is_student) {
    description = t('student_desc');
    show_action_button = false;
  } else {
    // For other roles (TEACHER, ADMIN), we show a generic contact message
    description = t('student_desc');
    show_action_button = false;
  }

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={t('title')}
      zIndex={11000}
      centered
      radius="md"
      padding="xl"
      size="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack align="center" gap="md">
        <ThemeIcon size={64} radius="xl" color="red" variant="light">
          <IoCloudOfflineOutline size={36} />
        </ThemeIcon>
        
        <Text ta="center" size="sm" fw={500} className="px-2">
          {description}
        </Text>

        <Group justify="center" w="100%" mt="lg">
          {show_action_button ? (
            <Button 
              onClick={handleAction} 
              fullWidth 
              radius="md" 
              size="md"
              className="shadow-sm transition-transform active:scale-95"
            >
              {button_text}
            </Button>
          ) : (
            <Button 
              onClick={() => setOpened(false)} 
              fullWidth 
              radius="md" 
              size="md"
              variant="light"
              color="gray"
            >
              {t('close_button')}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
