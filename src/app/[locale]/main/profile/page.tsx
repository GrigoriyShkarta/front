'use client';

import { ProfileInfoForm } from '@/components/layout/profile/components/profile-info-form';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/components/layout/profile/hooks/use-profile';
import { StudentGeneralInfo } from '@/components/layout/users/studentProfile/components/student-general-info';

export default function ProfileGeneralPage() {
  const { user } = useAuth();
  const { update_profile, is_updating } = useProfile();

  if (!user) return null;

  if (user.role === 'student') {
    return <StudentGeneralInfo user={user as any} is_own_profile />;
  }

  return (
    <ProfileInfoForm user={user} on_submit={update_profile} is_loading={is_updating} />
  );
}