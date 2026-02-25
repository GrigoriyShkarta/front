import { StudentProfileShell } from "@/components/layout/users/studentProfile/student-profile-layout";
import { PageContainer } from '@/components/common/page-container';

export default async function UserProfileLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <PageContainer>
      <StudentProfileShell id={id}>
        {children}
      </StudentProfileShell>
    </PageContainer>
  );
}
