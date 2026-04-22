import { api } from '@/lib/api';

export interface StorageStats {
  audio: number;
  photo: number;
  video: number;
  file: number;
  other: number;
  total_used: number;
  limit: number;
}

export const storageActions = {
  get_storage_stats: async () => {
    const response = await api.get('/space/storage-stats');
    return response.data as StorageStats;
  },
  get_top_files: async () => {
    const response = await api.get('/space/top-files');
    return response.data as any[];
  }
};
