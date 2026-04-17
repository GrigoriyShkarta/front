'use client';

import { useStorageUsage } from './use-storage-usage';
import { useTranslations } from 'next-intl';
import { notifications } from '@mantine/notifications';

export const useStorageLimitCheck = () => {
  const { storage_usage } = useStorageUsage();
  const t = useTranslations('Storage');

  const checkFile = (file: File) => {
    if (!storage_usage) return true;
    const { usageInBytes, limitInBytes } = storage_usage;
    
    if (usageInBytes + file.size > limitInBytes) {
      notifications.show({
        title: t('limitExceededTitle'),
        message: t('limitExceededMessage'),
        color: 'red',
        autoClose: 10000,
      });
      return false;
    }
    return true;
  };

  const checkFiles = (files: File[]) => {
    if (!storage_usage) return true;
    const { usageInBytes, limitInBytes } = storage_usage;
    
    const total_new_size = files.reduce((acc, f) => acc + f.size, 0);
    
    if (usageInBytes + total_new_size > limitInBytes) {
      notifications.show({
        title: t('limitExceededTitle'),
        message: t('limitExceededMessage'),
        color: 'red',
        autoClose: 10000,
      });
      return false;
    }
    return true;
  };

  return { checkFile, checkFiles };
};
