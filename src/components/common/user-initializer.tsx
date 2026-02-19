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
    // We only refresh if we entered the authorized zone (which usually implies we should be authenticated)
    refresh_user();
  }, [refresh_user]);

  return null;
}
