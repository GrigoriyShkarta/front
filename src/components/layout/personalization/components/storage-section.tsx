import React from 'react';
import { Card, Text, LoadingOverlay, Alert, Paper } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { StorageProgressBar } from '@/components/common/storage-progress-bar';
import { useStorageUsage } from '@/components/layout/users/hooks/use-storage-usage';
import { IoAlertCircleOutline } from 'react-icons/io5';

export const StorageSection = () => {
  const t = useTranslations('Storage');
  const { storage_usage, is_loading, is_error } = useStorageUsage();

  return (
    <Paper 
          withBorder 
          p="xl" 
          radius="md" 
          className="backdrop-blur-md transition-all duration-500 shadow-sm"
          style={{ 
            borderColor: 'var(--space-secondary)',
            backgroundColor: 'var(--space-card-bg)' 
          }}
        >
      <LoadingOverlay visible={is_loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Text size="lg" fw={600} mb="xs">
        {t('title')}
      </Text>
      
      <Text size="sm" c="dimmed" mb="xl">
        {t('description')}
      </Text>

      {is_error ? (
        <Alert icon={<IoAlertCircleOutline size={16} />} title={t('errorTitle')} color="red">
          {t('errorMessage')}
        </Alert>
      ) : storage_usage ? (
        <StorageProgressBar 
          usageInBytes={storage_usage.usageInBytes} 
          limitInBytes={storage_usage.limitInBytes} 
        />
      ) : null}
    </Paper>
  );
};
