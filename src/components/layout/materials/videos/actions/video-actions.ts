import { api } from '@/lib/api';
import { VideoListResponse, VideoMaterial } from '../schemas/video-schema';

interface GetVideosParams {
  page?: number;
  limit?: number;
  search?: string;
  category_ids?: string[];
}

export const videoActions = {
  /**
   * Get paginated list of video materials
   */
  get_videos: async (params: GetVideosParams): Promise<VideoListResponse> => {
    const response = await api.get('/materials/video', { 
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
   * Create new video material
   */
  create_video: async (data: { name: string; file?: File; youtube_url?: string; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<VideoMaterial> => {
    const form_data = new FormData();
    form_data.append('name', data.name);
    if (data.file) form_data.append('files', data.file);
    if (data.youtube_url) form_data.append('youtube_url', data.youtube_url);
    
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.post('/materials/video', form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Update existing video material
   */
  update_video: async (id: string, data: { name?: string; file?: File; youtube_url?: string; categories?: string[] }, onUploadProgress?: (progressEvent: any) => void): Promise<VideoMaterial> => {
    const form_data = new FormData();
    if (data.name) form_data.append('name', data.name);
    if (data.file) form_data.append('files', data.file);
    if (data.youtube_url) form_data.append('youtube_url', data.youtube_url);
    
    if (data.categories) {
      data.categories.forEach(id => {
        form_data.append('categories', id);
      });
    }

    const response = await api.patch(`/materials/video/${id}`, form_data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Delete single video material
   */
  delete_video: async (id: string): Promise<void> => {
    await api.delete(`/materials/video/${id}`);
  },

  /**
   * Delete multiple video materials
   */
  bulk_delete_videos: async (ids: string[]): Promise<void> => {
    await api.delete('/materials/video', { data: { ids } });
  }
};
