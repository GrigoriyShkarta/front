import { PageContainer } from '@/components/common/page-container';
import { UsersLayout } from '@/components/layout/users/users-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users Management | Lirnexa',
  description: 'Manage your space users, roles and permissions.',
};

export default function UsersPage() {
  return (
    <PageContainer>
      <UsersLayout />
    </PageContainer>
  );
}
