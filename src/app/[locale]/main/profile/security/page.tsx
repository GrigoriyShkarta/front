'use client';

import { SecurityForm } from '@/components/layout/profile/components/security-form';
import { useProfile } from '@/components/layout/profile/hooks/use-profile';

export default function ProfileSecurityPage() {
  const { change_password, is_changing_password } = useProfile();

  return (
    <SecurityForm on_submit={change_password} is_loading={is_changing_password} />
  );
}
