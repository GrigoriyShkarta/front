'use client';

import { Modal, Text, Group, Button, Stack, Box } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoWarningOutline } from 'react-icons/io5';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  is_loading: boolean;
  count?: number;
}

export function VideoDeleteModal({ opened, onClose, onConfirm, is_loading, count = 1 }: Props) {
  const t = useTranslations('Materials.video.delete_confirm');
  const common_t = useTranslations('Common');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('title')}
      centered
      classNames={{
        header: 'px-6 py-4',
        content: 'bg-[var(--mantine-color-body)] transition-colors duration-300',
        body: 'p-6'
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
           <Stack gap={4}>
             <Text size="sm" fw={500}>
               {count > 1 ? t('bulk_description', { count }) : t('description')}
             </Text>
             <Text size="xs" c="red" fw={500}>
               {t('warning')}
             </Text>
           </Stack>
        </Group>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={is_loading}>
            {common_t('cancel')}
          </Button>
          <Button 
            color="red" 
            onClick={onConfirm} 
            loading={is_loading}
          >
            {common_t('delete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
