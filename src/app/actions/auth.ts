'use server';

import { cookies } from 'next/headers';

/**
 * Server action to clear authentication cookies.
 */
export async function logoutAction() {
  const cookie_store = await cookies();
  cookie_store.delete('access_token');
  cookie_store.delete('refresh_token');
}
