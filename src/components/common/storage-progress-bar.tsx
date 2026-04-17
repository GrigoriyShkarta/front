import React from 'react';
import { Progress, Text, Stack, Card, Paper } from '@mantine/core';
import { formatBytes } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface StorageProgressBarProps {
  usageInBytes: number;
  limitInBytes: number;
}

export const StorageProgressBar: React.FC<StorageProgressBarProps> = ({
  usageInBytes,
  limitInBytes,
}) => {
  const t = useTranslations('Storage');
  
  const percent = limitInBytes > 0 ? (usageInBytes / limitInBytes) * 100 : 0;
  
  let color = 'green';
  if (percent >= 95) {
    color = 'red';
  } else if (percent >= 80) {
    color = 'yellow';
  }

  const usage_gb = (usageInBytes / (1024 * 1024 * 1024)).toFixed(2);
  const limit_gb = (limitInBytes / (1024 * 1024 * 1024)).toFixed(2);
  const formatted_usage = `${usage_gb} GB`;
  const formatted_limit = `${limit_gb} GB`;

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
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {t('storageUsage')}
        </Text>
        <Progress 
          value={percent} 
          color={color} 
          size="xl" 
          radius="xl"
          striped={percent >= 95}
          animated={percent >= 95}
        />
        <Text size="xs" color="dimmed" ta="right">
          {t('usageText', { 
            usage: formatted_usage, 
            limit: formatted_limit,
            percent: percent.toFixed(1)
          })}
        </Text>
      </Stack>
    </Paper>
  );
};
