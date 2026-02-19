import { api } from '@/lib/api';
import { AudioListResponse, AudioMaterial } from '../schemas/audio-schema';

interface GetAudiosParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const audioActions = {
  /**
   * Get paginated list of audio materials
   */
  get_audios: async (params: GetAudiosParams): Promise<AudioListResponse> => {
    const response = await api.get('/materials/audio', { 
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      }
    });
    return response.data;
  },

  /**
   * Create new audio material
   */
  create_audio: async (data: { name: string; file: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<AudioMaterial> => {
    const form_data = new FormData();
    form_data.append('name', data.name);
    form_data.append('files', data.file);
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.post('/materials/audio', form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Update existing audio material
   */
  update_audio: async (id: string, data: { name?: string; file?: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<AudioMaterial> => {
    const form_data = new FormData();
    if (data.name) form_data.append('name', data.name);
    if (data.file) form_data.append('file', data.file);
    
    if (data.categories) {
      // Clear existing first? PATCH usually updates/replaces.
      // If we send categories, we probably replace the list.
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.patch(`/materials/audio/${id}`, form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Delete single audio material
   */
  delete_audio: async (id: string): Promise<void> => {
    await api.delete(`/materials/audio/${id}`);
  },

  /**
   * Delete multiple audio materials
   */
  bulk_delete_audios: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/audio', { data: { ids } });
  }
};
