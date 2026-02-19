'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingOverlay } from '@mantine/core';
import { User } from '@/types/auth.types';
import { clearAuthCookies, getAccessToken } from '@/lib/auth';
import { api } from '@/lib/api';
import { user_schema } from '@/schemas/user-profile';
import { queryKeys } from '@/lib/query-keys';
import { logoutAction } from '@/app/actions/auth';

interface AuthContextType {
  user: User | null;
  is_authenticated: boolean;
  is_loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh_user: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch user data from API
 */
async function fetchUser(): Promise<User> {
  const response = await api.get('users/me');
  return user_schema.parse(response.data);
}

/**
 * AuthProvider - Uses React Query for user data management
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const query_client = useQueryClient();

  const {
    data: user = null,
    isLoading: is_loading,
    isError,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    gcTime: 0, // Don't cache on errors
  });

  const is_authenticated = !!user && !isError;


  const login = useCallback(() => {
    // Invalidate and refetch user data after login
    query_client.invalidateQueries({ queryKey: queryKeys.auth.user() });
  }, [query_client]);

  const logout = useCallback(async () => {
    // Clear user data from cache
    query_client.setQueryData(queryKeys.auth.user(), null);
    
    // Clear cookies both client-side and server-side for maximum reliability
    clearAuthCookies();
    await logoutAction();
  }, [query_client]);

  const refresh_user = useCallback(async () => {
    // Force refetch user data
    await query_client.invalidateQueries({ queryKey: queryKeys.auth.user() });
  }, [query_client]);

  const setUser = useCallback((updated_user: User | null) => {
    // Optimistically update user data in cache
    query_client.setQueryData(queryKeys.auth.user(), updated_user);
  }, [query_client]);

  if (is_loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[9999]">
        <LoadingOverlay visible loaderProps={{ size: 'lg', type: 'dots' }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        is_authenticated,
        is_loading,
        login,
        logout,
        refresh_user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
