import { PageContainer } from '@/components/common/page-container';
import { TestTakeLayout } from '@/components/layout/materials/tests/components/take-test/test-take-layout';

export const metadata = {
  title: 'Taking Test | Lirnexa',
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TakeTestPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = await searchParams;
  const course_id = typeof sParams.courseId === 'string' ? sParams.courseId : undefined;

  return (
    <PageContainer>
      <TestTakeLayout test_id={id} course_id={course_id} />
    </PageContainer>
  );
}
