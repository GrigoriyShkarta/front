import { PageContainer } from '@/components/common/page-container';
import { TestTakeLayout } from '@/components/layout/materials/tests/components/take-test/test-take-layout';

export const metadata = {
  title: 'Taking Test | Lirnexa',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TakeTestPage({ params }: Props) {
  const { id } = await params;

  return (
    <PageContainer>
      <TestTakeLayout test_id={id} />
    </PageContainer>
  );
}
