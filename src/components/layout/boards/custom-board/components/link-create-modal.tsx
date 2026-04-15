'use client';

import { useState } from 'react';
import { Modal, TextInput, Button, Stack, Group, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { IoLinkOutline } from 'react-icons/io5';

interface LinkCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (url: string) => void;
}

export function LinkCreateModal({ opened, onClose, onAdd }: LinkCreateModalProps) {
  const t = useTranslations('Boards');
  const common_t = useTranslations('Common');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handle_submit = () => {
    if (!url.trim()) {
      setError(common_t('required') || 'Required');
      return;
    }
    
    let target_url = url.trim();
    if (!/^https?:\/\//i.test(target_url)) {
      target_url = 'https://' + target_url;
    }

    try {
      new URL(target_url);
      onAdd(target_url);
      setUrl('');
      setError('');
      onClose();
    } catch {
      setError('Invalid URL');
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="xs">
          <IoLinkOutline color="var(--space-primary)" />
          <Text fw={600}>{t('link')}</Text>
        </Group>
      }
      centered
      radius="lg"
      size="sm"
      zIndex={2000}
      overlayProps={{ blur: 5, opacity: 0.4 }}
    >
      <Stack gap="md">
        <TextInput 
          label={t('enter_link')}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          error={error}
          onKeyDown={(e) => e.key === 'Enter' && handle_submit()}
          autoFocus
          radius="md"
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose} radius="md" c="gray">
            {common_t('cancel')}
          </Button>
          <Button 
            onClick={handle_submit} 
            radius="md" 
            style={{ backgroundColor: 'var(--space-accent)', color: 'var(--space-accent-text)' }}
          >
            {common_t('add')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
