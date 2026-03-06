'use client';

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingOverlay } from '@mantine/core';
import { User } from '@/types/auth.types';
import { clearAuthCookies } from '@/lib/auth';
import { api } from '@/lib/api';
import { user_schema } from '@/schemas/user-profile';
import { queryKeys } from '@/lib/query-keys';
import { logoutAction } from '@/app/actions/auth';

interface AuthContextType {
  user: User | null;
  is_authenticated: boolean;
  is_loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refresh_user: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch user data from API
 */
async function fetchUser(): Promise<User> {
  const response = await api.get('users/me', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
  return user_schema.parse(response.data);
}

/**
 * AuthProvider - Uses React Query for user data management
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const query_client = useQueryClient();

  const {
    data: user = null,
    isPending: is_loading,
    isError,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 min — won't refetch on every navigation
    refetchOnWindowFocus: false,  // Disable — causes hang on page navigation in Next.js
    refetchOnMount: true,         // Fetch on first load (cache is empty after reload)
    gcTime: 10 * 60 * 1000,      // Keep in cache for 10 minutes
  });

  const is_authenticated = !!user && !isError;


  const login = useCallback(async () => {
    // Directly fetch user data and put into cache — avoids `enabled` state issue
    try {
      const user_data = await fetchUser();
      query_client.setQueryData(queryKeys.auth.user(), user_data);
    } catch {
      // If fetch fails for some reason, fall back to invalidate
      query_client.invalidateQueries({ queryKey: queryKeys.auth.user() });
    }
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
      {is_loading && !user && (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[9999]">
          <LoadingOverlay visible loaderProps={{ size: 'lg', type: 'dots' }} />
        </div>
      )}
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
