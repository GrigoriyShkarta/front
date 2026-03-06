'use client';

import { MaterialsLayout } from '@/components/layout/users/studentProfile/materials/components/materials-layout';
import { useAuth } from '@/hooks/use-auth';

export default function MyLessonsPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <MaterialsLayout student_id={user.id} initial_tab="additional" />
  );
}
