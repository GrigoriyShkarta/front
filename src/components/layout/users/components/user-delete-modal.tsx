'use client';

import { Modal, Text, Group, Button, Stack } from '@mantine/core';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  on_close: () => void;
  on_confirm: () => void;
  is_loading: boolean;
  is_bulk?: boolean;
}

export function UserDeleteModal({ opened, on_close, on_confirm, is_loading, is_bulk }: Props) {
  const t = useTranslations('Users');
  const common_t = useTranslations('Common');

  return (
    <Modal 
      opened={opened} 
      onClose={on_close} 
      title={t('delete_modal.title')}
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          {is_bulk ? t('delete_modal.bulk_description') : t('delete_modal.description')}
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" color="gray" onClick={on_close} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button color="red" onClick={on_confirm} loading={is_loading}>
            {common_t('delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
