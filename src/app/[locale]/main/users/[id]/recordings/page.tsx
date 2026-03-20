'use client';

import { StudentProfileShell } from '@/components/layout/users/studentProfile/student-profile-layout';
import { useParams } from 'next/navigation';

export default function AdminStudentRecordingsPage() {
  const params = useParams();
  const id = params?.id as string;

  return null;
}
