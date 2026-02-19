import { api } from '@/lib/api';
import { LoginFormData } from '@/components/layout/auth/schemas/auth';
import { AuthResponse } from '@/types/auth.types';

export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};
