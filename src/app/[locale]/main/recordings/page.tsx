'use client';

import { StudentProfileShell } from '@/components/layout/users/studentProfile/student-profile-layout';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

/**
 * Student's view of their own lesson recordings.
 * Reuses the StudentProfileShell with is_own_profile=true.
 */
export default function StudentRecordingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <StudentProfileShell 
      id={user.id} 
      is_own_profile={true}
      hide_user_info={true}
      hide_tabs={true}
    >
      <div className="hidden">Own recordings</div>
    </StudentProfileShell>
  );
}
