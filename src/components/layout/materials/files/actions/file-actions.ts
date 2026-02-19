import { api } from '@/lib/api';
import { FileListResponse, FileMaterial } from '../schemas/file-schema';

interface GetFilesParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const fileActions = {
  /**
   * Get paginated list of file materials
   */
  get_files: async (params: GetFilesParams): Promise<FileListResponse> => {
    const response = await api.get('/materials/files', { 
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
   * Create new file material
   */
  create_file: async (data: { name: string; file: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<FileMaterial> => {
    const form_data = new FormData();
    form_data.append('name', data.name);
    form_data.append('files', data.file);
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.post('/materials/files', form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Update existing file material
   */
  update_file: async (id: string, data: { name?: string; file?: File; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<FileMaterial> => {
    const form_data = new FormData();
    if (data.name) form_data.append('name', data.name);
    if (data.file) form_data.append('file', data.file);
    
    if (data.categories) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.patch(`/materials/files/${id}`, form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Delete single file material
   */
  delete_file: async (id: string): Promise<void> => {
    await api.delete(`/materials/files/${id}`);
  },

  /**
   * Delete multiple file materials
   */
  bulk_delete_files: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/files', { data: { ids } });
  }
};
