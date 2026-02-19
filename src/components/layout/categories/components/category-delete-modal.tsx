'use client';

import { Modal, Text, Group, Button, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  is_loading: boolean;
  count?: number;
}

export function CategoryDeleteModal({ opened, onClose, onConfirm, is_loading, count = 1 }: Props) {
  const t = useTranslations('Categories.delete_confirm');
  const common_t = useTranslations('Common');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('title')}
      centered
      classNames={{
        header: 'px-6 py-4',
        content: 'transition-colors duration-300',
        body: 'p-6'
      }}
      styles={{
        header: { 
          backgroundColor: 'var(--mantine-color-body)', 
        },
        content: { 
          backgroundColor: 'var(--mantine-color-body)', 
          color: 'var(--foreground)'
        }
      }}
    >
      <Stack gap="xl">
        <Text size="sm">
          {count > 1 
            ? t('bulk_description', { count }) 
            : t('description')
          }
        </Text>

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button color="red" onClick={onConfirm} loading={is_loading}>
            {common_t('delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
