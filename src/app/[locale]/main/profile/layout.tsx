import { ProfileShellSwitcher } from '@/components/layout/profile/profile-switcher';
import { PageContainer } from '@/components/common/page-container';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer>
      <ProfileShellSwitcher>
        {children}
      </ProfileShellSwitcher>
    </PageContainer>
  );
}
