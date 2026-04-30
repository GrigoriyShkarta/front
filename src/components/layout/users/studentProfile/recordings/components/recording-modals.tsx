'use client';

import { Modal, Stack, TextInput, Group, Button, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

interface EditModalProps {
  opened: boolean;
  onClose: () => void;
  url: string;
  onChange: (url: string) => void;
  onSave: () => void;
  isValid: boolean;
}

/**
 * Modal to add or edit recording URL.
 */
export function EditRecordingModal({ 
  opened, 
  onClose, 
  url, 
  onChange, 
  onSave, 
  isValid 
}: EditModalProps) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');

  return (
    <Modal opened={opened} onClose={onClose} title={t('edit')} centered radius="md">
      <Stack gap="md">
        <TextInput 
          label="URL (YouTube)" 
          value={url} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          radius="md"
          withAsterisk
          error={url && !isValid ? t('invalid_youtube_url') : null}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>{common_t('cancel')}</Button>
          <Button 
            onClick={onSave} 
            radius="md" 
            color="primary"
            disabled={!url || !isValid}
            className="bg-primary hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {common_t('save')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface DeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onDelete: () => void;
}

/**
 * Confirmation modal for deleting a recording.
 */
export function DeleteRecordingModal({ 
  opened, 
  onClose, 
  onDelete 
}: DeleteModalProps) {
  const t = useTranslations('Calendar.lesson_room.recordings_ui');
  const common_t = useTranslations('Common');

  return (
    <Modal opened={opened} onClose={onClose} title={common_t('delete')} centered radius="md">
      <Stack gap="md">
        <Text size="sm">{t('delete_confirm')}</Text>
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>{common_t('cancel')}</Button>
          <Button color="red" onClick={onDelete} radius="md">{common_t('delete')}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
