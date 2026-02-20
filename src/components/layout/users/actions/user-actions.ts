import { api } from '@/lib/api';
import { UserListResponse, UserFormData, UserListItem } from '@/schemas/users';

export const userActions = {
  get_users: async (params?: Record<string, any>) => {
    const response = await api.get('/users', { 
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
    return response.data as UserListResponse;
  },

  create_user: async (data: UserFormData) => {
    // If avatar is a file, we might need FormData
    if (data.avatar instanceof File) {
      const form_data = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form_data.append(key, value);
        }
      });
      const response = await api.post('/users', form_data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await api.post('/users', data);
    return response.data;
  },

  update_user: async (id: string, data: Partial<UserFormData>) => {
    // 1. Filter out fields we don't want to send if they are empty
    const clean_data: any = { ...data };
    
    // Don't send empty password
    if (!clean_data.password) {
      delete clean_data.password;
    }
    
    // If avatar is just a string (current URL), we don't need to send it back as a file
    // The backend won't update it if it's the same string or missing (usually)
    if (typeof clean_data.avatar === 'string') {
      delete clean_data.avatar;
    }

    // 2. Determine if we need FormData (for file uploads)
    const has_file = clean_data.avatar instanceof File;

    if (has_file) {
      const form_data = new FormData();
      Object.entries(clean_data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
          // Properly append array items for multipart/form-data
          value.forEach(item => form_data.append(key, item));
        } else if (value instanceof File) {
          form_data.append(key, value);
        } else {
          form_data.append(key, String(value));
        }
      });

      const response = await api.patch(`/users/${id}`, form_data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    // 3. Send as JSON if no files
    const response = await api.patch(`/users/${id}`, clean_data);
    return response.data;
  },

  delete_user: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  delete_users: async (ids: string[]) => {
    const response = await api.post('/users/bulk-delete', { ids });
    return response.data;
  },

  get_user: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data as UserListItem;
  }
};
