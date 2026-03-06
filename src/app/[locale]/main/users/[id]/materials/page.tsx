import { StudentProfileShell } from '@/components/layout/users/studentProfile/student-profile-layout';
import { MaterialsLayout } from '@/components/layout/users/studentProfile/materials/components/materials-layout';

export default async function StudentMaterialsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  return (
    <MaterialsLayout student_id={id} />
  );
}
