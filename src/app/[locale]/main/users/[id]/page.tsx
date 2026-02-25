'use client';

import { useUserQuery } from '@/components/layout/users/hooks/use-user-query';
import { useParams } from 'next/navigation';
import { LoadingOverlay, Box } from '@mantine/core';
import { StudentGeneralInfo } from '@/components/layout/users/studentProfile/components/student-general-info';

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const { user, is_loading } = useUserQuery(id);

  if (is_loading) return <Box mih={200} pos="relative"><LoadingOverlay visible /></Box>;
  if (!user) return null;

  return <StudentGeneralInfo user={user} />;
}
