import { PageContainer } from '@/components/common/page-container';
import { UserProfileLayout } from '@/components/layout/users/user-profile-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile | Lirnexa',
  description: 'View and manage user profile details.',
};

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <PageContainer>
      <UserProfileLayout id={id} />
    </PageContainer>
  );
}
