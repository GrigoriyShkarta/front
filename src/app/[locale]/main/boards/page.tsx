'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';

/**
 * Boards entry point. Redirects based on user role.
 * Admins/Teachers -> Student Selection Layout.
 * Students -> Direct Board Layout.
 */
export default function BoardsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user.role === 'student') {
      router.replace(`/main/boards/${user.id}`);
    } else {
      router.replace('/main/boards/select');
    }
  }, [user, router]);

  return (
    <Box className="relative h-64">
      <LoadingOverlay visible />
    </Box>
  );
}
