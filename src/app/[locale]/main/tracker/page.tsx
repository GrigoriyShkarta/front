'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';
import { LoadingOverlay, Box } from '@mantine/core';

export default function TrackerPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    if (user.role === 'student') {
      router.replace(`/main/tracker/${user.id}`);
    } else {
      router.replace('/main/tracker/select');
    }
  }, [user, router]);

  return (
    <Box className="relative h-64">
      <LoadingOverlay visible />
    </Box>
  );
}
