import { api } from '@/lib/api';
import { PhotoListResponse, PhotoMaterial } from '../schemas/photo-schema';

interface GetPhotosParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const photoActions = {
  /**
   * Get paginated list of photo materials
   */
  get_photos: async (params: GetPhotosParams): Promise<PhotoListResponse> => {
    const response = await api.get('/materials/photo', { 
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
   * Create new photo material
   */
  create_photo: async (data: { name: string; file: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<PhotoMaterial> => {
    const form_data = new FormData();
    form_data.append('name', data.name);
    form_data.append('files', data.file);
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.post('/materials/photo', form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Update existing photo material
   */
  update_photo: async (id: string, data: { name?: string; file?: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<PhotoMaterial> => {
    const form_data = new FormData();
    if (data.name) form_data.append('name', data.name);
    if (data.file) form_data.append('file', data.file);
    
    if (data.categories) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.patch(`/materials/photo/${id}`, form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Delete single photo material
   */
  delete_photo: async (id: string): Promise<void> => {
    await api.delete(`/materials/photo/${id}`);
  },

  /**
   * Delete multiple photo materials
   */
  bulk_delete_photos: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/photo', { data: { ids } });
  }
};
