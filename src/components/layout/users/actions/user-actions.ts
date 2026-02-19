import { api } from '@/lib/api';
import { UserListResponse, UserFormData } from '@/schemas/users';

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
    if (data.avatar instanceof File) {
      const form_data = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form_data.append(key, value);
        }
      });
      const response = await api.patch(`/users/${id}`, form_data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete_user: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  delete_users: async (ids: string[]) => {
    const response = await api.post('/users/bulk-delete', { ids });
    return response.data;
  }
};
