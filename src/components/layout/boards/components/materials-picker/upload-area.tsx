'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Stack, Group, Text, Button, ActionIcon, Progress, Box, Paper, TextInput } from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IoCloudUploadOutline, IoCloseOutline } from 'react-icons/io5';

interface UploadAreaProps {
  onUpload: (files: FileWithPath[], customName: string) => Promise<void>;
  loading?: boolean;
  accept?: string[];
  maxFiles?: number;
}

/**
 * Universal upload component with drag-and-drop support.
 * Shows selected file and upload progress.
 */
export function UploadArea({ onUpload, loading, accept, maxFiles = 1 }: UploadAreaProps) {
  const t = useTranslations('Materials');
  const common_t = useTranslations('Common');
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [customName, setCustomName] = useState('');

  const handleDrop = (dropped: FileWithPath[]) => {
    setFiles(dropped);
    if (dropped.length > 0 && !customName) {
      setCustomName(dropped[0].name.split('.')[0]);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setCustomName('');
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    await onUpload(files, customName);
    setFiles([]);
    setCustomName('');
  };

  return (
    <Stack gap="xs">
      {!files.length ? (
        <Dropzone
          onDrop={handleDrop}
          disabled={loading}
          maxFiles={maxFiles}
          accept={accept}
          p="md"
          radius="md"
          className="border-dashed h-full hover:border-[var(--space-primary)] transition-colors bg-white/5"
        >
          <Stack align="center" gap={4} py="sm">
            <IoCloudUploadOutline size={32} className="opacity-50" />
            <Text size="sm" ta="center">
              {t('audio.form.file') || 'Drag files here or click to select'}
            </Text>
            <Text size="xs" c="dimmed">
              {t('audio.form.drop_hint') || 'Max 100MB'}
            </Text>
          </Stack>
        </Dropzone>
      ) : (
        <Paper withBorder p="sm" radius="md" className="bg-white/5 border-white/10">
          <Stack gap="sm">
            {files.map((file, idx) => (
              <Group key={idx} justify="space-between" wrap="nowrap">
                <Box className="overflow-hidden flex-1">
                  <Text size="sm" fw={500} lineClamp={1}>{file.name}</Text>
                  <Text size="xs" c="dimmed">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                </Box>
                <ActionIcon variant="subtle" color="red" onClick={clearFiles} disabled={loading}>
                  <IoCloseOutline size={20} />
                </ActionIcon>
              </Group>
            ))}
            
            <TextInput 
              placeholder={t('video.form.name') || 'Display Name'} 
              value={customName} 
              onChange={(e) => setCustomName(e.currentTarget.value)}
              size="xs"
              radius="md"
              disabled={loading}
            />
            
            <Button 
                fullWidth 
                onClick={handleSubmit} 
                disabled={loading}
                variant="light"
                color="primary"
                radius="md"
            >
                {t('audio.form.uploading') || common_t('add')}
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
