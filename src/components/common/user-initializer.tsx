'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/context/auth-context';

/**
 * Component that triggers user profile synchronization 
 * whenever it is mounted (e.g. at the start of the authorized zone).
 */
export function UserInitializer() {
  const { refresh_user, is_authenticated } = useAuthContext();

  useEffect(() => {
    // React Query handles refetching on mount automatically via useQuery config
  }, []);

  return null;
}
