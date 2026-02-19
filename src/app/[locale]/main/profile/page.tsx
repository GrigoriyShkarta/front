import { PageContainer } from '@/components/common/page-container';
import { ProfileLayout } from '@/components/layout/profile/profile-layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Lirnexa',
  description: 'Manage your personal profile and account security.',
};

export default function ProfilePage() {
  return (
    <PageContainer>
      <ProfileLayout />
    </PageContainer>
  );
}