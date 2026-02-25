'use client';

import { ProfileLayout } from './profile-layout';
import { useAuth } from '@/hooks/use-auth';
import { LoadingOverlay, Box } from '@mantine/core';
import { StudentProfileShell } from '../users/studentProfile/student-profile-layout';

interface Props {
  children: React.ReactNode;
}

export function ProfileShellSwitcher({ children }: Props) {
  const { user, is_loading } = useAuth();
  
  if (is_loading) {
    return (
      <Box mih={400} className="relative">
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (user?.role === 'student') {
    return (
      <StudentProfileShell id={user.id} is_own_profile>
        {children}
      </StudentProfileShell>
    );
  }
  
  // For admins/teachers, we'll keep the current ProfileLayout for now
  // Note: This might need further adjustment if they need nested routes too
  return <ProfileLayout>{children}</ProfileLayout>;
}
