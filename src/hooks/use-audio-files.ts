import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

// Types
export interface AudioFile {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

export interface AudioListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface AudioListResponse {
  data: AudioFile[];
  total: number;
  page: number;
  per_page: number;
}

/**
 * Hook to fetch audio files list with pagination
 * @param params - Filters and pagination params
 */
export function useAudioFiles(params: AudioListParams = {}) {
  return useQuery({
    queryKey: queryKeys.materials.audio.list(params),
    queryFn: async () => {
      const response = await api.get<AudioListResponse>('materials/audio', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to upload audio files
 */
export function useUploadAudioFiles() {
  const query_client = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('materials/audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate audio list to refetch new data
      query_client.invalidateQueries({ queryKey: queryKeys.materials.audio.all() });
    },
  });
}

/**
 * Hook to delete audio file
 */
export function useDeleteAudioFile() {
  const query_client = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`materials/audio/${id}`);
    },
    onSuccess: () => {
      // Invalidate audio list to refetch
      query_client.invalidateQueries({ queryKey: queryKeys.materials.audio.all() });
    },
  });
}

/**
 * Hook to delete multiple audio files
 */
export function useDeleteMultipleAudioFiles() {
  const query_client = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post('materials/audio/delete-multiple', { ids });
    },
    onSuccess: () => {
      query_client.invalidateQueries({ queryKey: queryKeys.materials.audio.all() });
    },
  });
}

/**
 * Hook to update audio file metadata
 */
export function useUpdateAudioFile() {
  const query_client = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await api.patch(`materials/audio/${id}`, { name });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific audio detail
      query_client.invalidateQueries({ 
        queryKey: queryKeys.materials.audio.detail(variables.id) 
      });
      // Invalidate list to show updated data
      query_client.invalidateQueries({ 
        queryKey: queryKeys.materials.audio.all() 
      });
    },
  });
}
