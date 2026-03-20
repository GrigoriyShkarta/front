'use client';

import { ProfileLayout } from './profile-layout';
import { useAuth } from '@/hooks/use-auth';
import { LoadingOverlay, Box } from '@mantine/core';
import { StudentProfileShell } from '../users/studentProfile/student-profile-layout';
import { usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface Props {
  children: React.ReactNode;
}

export function ProfileShellSwitcher({ children }: Props) {
  const { user, is_loading } = useAuth();
  const pathname = usePathname();
  const tNav = useTranslations('Navigation');
  const tUsers = useTranslations('Users');

  if (is_loading) {
    return (
      <Box mih={400} className="relative">
        <LoadingOverlay visible />
      </Box>
    );
  }

  const is_recordings = pathname.endsWith('/recordings');

  if (user?.role === 'student') {
    return (
      <StudentProfileShell 
        id={user.id} 
        is_own_profile 
        hide_user_info={is_recordings}
        hide_tabs={is_recordings}
        custom_breadcrumbs={is_recordings ? [
          { title: tNav('dashboard'), href: '/main' },
          { title: tUsers('tabs.recordings'), href: '/main/profile/recordings' }
        ] : undefined}
      >
        {children}
      </StudentProfileShell>
    );
  }
  
  // For admins/teachers, we'll keep the current ProfileLayout for now
  // Note: This might need further adjustment if they need nested routes too
  return <ProfileLayout>{children}</ProfileLayout>;
}
