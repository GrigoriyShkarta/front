import { PageContainer } from '@/components/common/page-container';
import { TestDetailLayout } from '@/components/layout/materials/tests/components/test-detail-layout';

export const metadata = {
  title: 'Test Details | Lirnexa',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TestDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <PageContainer>
      <TestDetailLayout test_id={id} />
    </PageContainer>
  );
}
