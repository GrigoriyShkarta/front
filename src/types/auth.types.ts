import { UserProfile } from '@/schemas/user-profile';

export type User = UserProfile;

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  id: string;
  role: UserRole;
  name: string;
}

export interface AuthState {
  user: User | null;
  is_authenticated: boolean;
}
