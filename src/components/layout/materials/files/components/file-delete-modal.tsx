'use client';

import { Modal, Text, Button, Group, Stack, Box } from '@mantine/core';
import { IoTrashOutline, IoWarningOutline } from 'react-icons/io5';
import { useTranslations } from 'next-intl';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  is_loading: boolean;
  count: number;
}

export function FileDeleteModal({ opened, onClose, onConfirm, is_loading, count }: Props) {
  const t = useTranslations('Materials.file.delete_confirm');
  const common_t = useTranslations('Common');

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={t('title')}
      centered
      radius="lg"
      styles={{
        header: { backgroundColor: 'var(--mantine-color-body)' },
        content: { backgroundColor: 'var(--mantine-color-body)' }
      }}
    >
      <Stack gap="xl">
        <Group wrap="nowrap" align="flex-start" gap="md">
           <Box 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--mantine-color-red-light)', color: 'var(--mantine-color-red-filled)' }}
           >
             <IoWarningOutline size={24} />
           </Box>
           <Text size="sm">
             {count > 1 ? t('bulk_description', { count }) : t('description')}
           </Text>
        </Group>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button 
            color="red" 
            onClick={onConfirm} 
            loading={is_loading}
            leftSection={<IoTrashOutline size={16} />}
          >
            {common_t('delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
