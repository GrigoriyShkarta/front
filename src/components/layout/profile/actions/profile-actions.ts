import { api } from '@/lib/api';
import { ProfileUpdateData, ChangePasswordData } from '../schemas/profile-schema';

export const profileActions = {
  update_profile: async (data: ProfileUpdateData) => {
    if (data.avatar instanceof File) {
      const form_data = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form_data.append(key, value);
        }
      });
      const response = await api.patch('/users/me', form_data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }

    const response = await api.patch('/users/me', data);
    return response.data;
  },

  change_password: async (data: ChangePasswordData) => {
    const response = await api.patch('/users/me/password', data);
    return response.data;
  }
};
